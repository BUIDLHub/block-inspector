import Web3 from 'web3';
import * as yup from 'yup';
import EventEmitter from 'events';
import {Logger} from 'bi-utils';

const schema = yup.object({
    URL: yup.string(),
    provider: yup.object(),
    id: yup.number().min(1).required("Missing connector id setting"),
    maxRetries: yup.number()
})

const replaySchema = yup.object({
    fromBlock: yup.number().required("Missing fromBlock on replay block range"),
    toBlock: yup.number()
})

const log = new Logger({component: "bi-Connector"});

export default class Connector extends EventEmitter {
    constructor(props) {
        super();
        log.debug("Connector config", props);
        schema.validateSync(props);
        this.URL = props.URL;
        this.provider = props.provider;
        if(!this.provider && (!this.URL || this.URL.trim().length === 0)) {
            throw new Error("Must have a web3 provider or an RPC endpoint URL to connect to");
        }
        this.id = props.id;
        this.maxRetries = props.maxRetries || 50;
        this.closed = true;
        [
            'currentBlock',
            'open',
            'close',
            'pause',
            'startBlockSubscription',
            'transactions',
            'receipt'
        ].forEach(fn=>this[fn]=this[fn].bind(this))
    }

    async currentBlock(force) {
        if(this.closed) {
            throw new Error("Attemptng to get block after closed");
        }
        if(force) {
            let n = await this.web3.eth.getBlockNumber();
            let b = await this.web3.eth.getBlock(n, true);
            this.lastBlock = b;
        }
        return this.lastBlock;
    }

    async getBlock(num) {
        if(this.closed) {
            throw new Error("Attempting to get block with closed connector")
        }
        let b = await this.web3.eth.getBlock(num)
        if(b && b.number > 0) {
            b.networkId = this.networkId;
        }
        
        return b;
    }

    async open() {
        
        if(this.provider) {
            this.needsPolling = true;
            this.web3 = new Web3(this.provider);
        } else if(this.URL.startsWith("ws")) {
            log.info("Opening web3 connection to ", this.URL);
           this.web3 = new Web3(new Web3.providers.WebsocketProvider(this.URL))
       } else {
        log.info("Opening web3 connection to ", this.URL);
           this.needsPolling = true;
           this.web3 = new Web3(new Web3.providers.HttpProvider(this.URL))
       }
       try {
        this.networkId = await this.web3.eth.net.getId();
        if(!this.networkId) {
            throw new Error("Could not get network id from web3");
        }
        let n = await this.web3.eth.getBlockNumber();
        this.closed = false;
        this.lastBlock = await this.web3.eth.getBlock(n, true);
        this.lastBlock.networkId = this.networkId;
        log.info("Current block number for network is", this.lastBlock.number);
       } catch (e) {
           log.error("Problem getting block number through connector", e);
       }
    }

    async startBlockSubscription() {
        if(this.closed) {
            throw new Error("Attemptng to subscribe after closed");
        }
        
        if(this.needsPolling) {
            await this.setupPoller();
        } else {
            this.subCallback = async (block) => {
                if(block) {
                    block.networkId = this.networkId;
                    log.debug("incoming block", block.number);
                    this.emit("block", block)
                }
            };

            log.info("Starting subscription for new blocks");
            this.sub = this.web3.eth.subscribe('newBlockHeaders');
            this.sub.on("data", this.subCallback);
        }
    }

    async close() {
        this.closed = true;
        if(!this.needsPolling) {
            await this.web3.eth.clearSubscriptions();
        } else if(this.poller) {
            await this.poller.stop();
        }
    }

    async pause() {
        if(!this.needsPolling) {
            await this.web3.eth.clearSubscriptions();
            this.sub.removeListener("data", subCallback);
        } else if(this.poller) {
            await this.poller.stop();
        }
    }

    setupPoller() {
        if(this.poller) {
            return this.poller.start();
        }
        log.info("Will use polling for new blocks");
        this.poller = new Poller(this, this.maxRetries, this.lastBlock, (block,e)=>{
            if(e) {
                log.error("Getting error in poll", e);
                this.emit("error", e);
            } else if(block) {
                if(block) {
                    block.networkId = this.networkId;
                    log.info("Getting block from poller", block.number, block.networkId);
                    this.lastBlock = block;
                    this.emit("block", block);
                }
            }
        });
        return this.poller.start();
    }

    async transactions(block) {
        if(block.transactions && block.transactions.length > 0 && typeof block.transactions[0] !== 'string') {
            return block.transactions;
        }
        try {
            let ctx = {
                tries: 0,
                maxRetries: this.maxRetries,
                keepGoing: true
            };
            let b = await execWithRetries(ctx, this.web3.eth.getBlock, block.number, true);

            b.transactions = b.transactions.map(t=>{
                return _normalize(t);
            });
            return b.transactions;
        } catch (e) {
            log.error("Problem getting transactions for block", e);
            throw e;
        }
    }

    async receipt(txn) {
        if(txn.receipt) {
            return txn.receipt;
        }
        try {
            let ctx = {
                tries: 0,
                maxRetries: this.maxRetries,
                keepGoing: true
            };
            let r = null;
            while(r === null) {
                ctx.tries = 0;
                r = await execWithRetries(ctx, this.web3.eth.getTransactionReceipt, txn.hash);
                if(r === null) {
                    await sleep(500);
                }
            }

            return r;
        } catch (e) {
            log.error("Problem getting receipt", e);
            throw e;
        }
    }
}

const _normalize = (t) => {
    if(t.to) {
        t.to = t.to.toLowerCase();
    }
    if(t.from) {
        t.from = t.from.toLowerCase();
    }
    return t;
}

class Poller {
    constructor(conn, maxRetries, currentBlock, callback) {
        this.connector = conn;
        this.maxRetries = maxRetries;
        this.callback = callback;
        this.polling = true;
        this.lastBlock = currentBlock;
        [
            'start',
            'stop',
            '_doPoll'
        ].forEach(fn=>this[fn]=this[fn].bind(this));
    }

    start() {
        
        return new Promise(async (done,err)=>{
            log.info("Starting poller to poll for new blocks");
            this.polling = true;
            /*
            try {
                log.debug("Sending first block to callback", (this.lastBlock?this.lastBlock.number:"unknown"));
                this.callback(this.lastBlock);
            } catch (e) {
                return err(e);
            }
            */

            let ctx = {
                tries: 0,
                maxRetries: this.maxRetries,
                keepGoing: this.polling,
                sleepTime: 5000
            }
            let handler = async () => {
                if(!this.polling) {
                    log.info("Polling stopped");
                    return;
                }

                try {
                    let s = Date.now();
                    ctx.tries = 0;
                    ctx.keepGoing = this.polling;
                    await this._doPoll(ctx);
                    let next = 5000 - (Date.now()-s);
                    if(next < 0) {
                        next = 5000;
                    }
                    ctx.sleepTime = next;
                    log.info("Sleeping", ctx.sleepTime,"ms before next poll");
                    this.timeout = setTimeout(handler, ctx.sleepTime);
                } catch (e) {
                    log.error("Could not pull blocks after max retries", e);
                    this.callback(null, e);
                    ctx.tries = 0;
                    ctx.sleepTime = 5000;
                    this.timeout = setTimeout(handler, ctx.sleepTime);
                }
            }
            if(this.polling) {
                log.info("Scheduling poll after", ctx.sleepTime,'ms');
                this.timeout = setTimeout(handler, ctx.sleepTime);
            }
            
            done();
        })
    }

    stop() {
        this.polling = false;
        if(this.timeout) {
            log.info("Stopping scheduled polling")
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    async _doPoll(ctx) {
        try {
            let block = await execWithRetries(ctx, this.connector.web3.eth.getBlock, this.lastBlock.number+1, true);
            let last = this.lastBlock;
            if(block && block.number !== last.number) {
                this.lastBlock = block;
                log.info("Sending block since doesn't match new block", block.number, last.number);
                this.callback(block);
            } else {
                log.debug("Block number is same as last block");
            }
        } catch (e) {
            log.error("Problem polling for next block", e);
        }
    }
}

const sleep = (ms) => {
    return new Promise(done=>{
        setTimeout(done, ms);
    })
}

const execWithRetries = (ctx, fn, ...args) => {
    return new Promise(async (done, err)=>{
        log.debug("Interacting with web3 with retries", ctx);
        let lastErr = null;
        while(ctx.tries < ctx.maxRetries) {
            ++ctx.tries;
            if(!ctx.keepGoing) {
                log.debug("Context said to stop");
                return done();
            }
            try {
                log.debug("Calling web3...");
                let res = await fn(...args);
                return done(res);
            } catch (e) {
                lastErr = e;
                
                if(ctx.tries > ctx.maxRetries) {
                   return err(e)
                } else {
                    log.warn("Problem getting next block, will retry", e);
                    await sleep(1000);
                }
            }
        }
        err(new Error("Somehow did not execute. Last error was: " + (lastErr?lastErr.message:"unknown")));
    });
}