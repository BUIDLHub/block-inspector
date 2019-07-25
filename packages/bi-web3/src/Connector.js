import Web3 from 'web3';
import * as yup from 'yup';
import EventEmitter from 'events';
import {Logger} from 'bi-utils';

const schema = yup.object({
    URL: yup.string().required("Missing connector URL setting"),
    id: yup.number().min(1).required("Missing connector id setting"),
    maxRetries: yup.number()
})

const log = new Logger({component: "bi-Connector"});

export default class Connector extends EventEmitter {
    constructor(props) {
        super();
        log.debug("Connector config", props);
        schema.validateSync(props);
        this.URL = props.URL;
        this.id = props.id;
        this.maxRetries = props.maxRetries || 50;
        this.closed = false;
        [
            'currentBlock',
            'open',
            'close',
            'startBlockSubscription',
            'transactions',
            'receipt'
        ].forEach(fn=>this[fn]=this[fn].bind(this))
    }

    async currentBlock() {
        if(this.closed) {
            throw new Error("Attemptng to get block after closed");
        }
        return this.lastBlock;
    }

    async open() {
        log.info("Opening web3 connection to ", this.URL);
       if(this.URL.startsWith("ws")) {
           this.web3 = new Web3(new Web3.providers.WebsocketProvider(this.URL))
       } else {
           this.needsPolling = true;
           this.web3 = new Web3(new Web3.providers.HttpProvider(this.URL))
       }
       try {
        let n = await this.web3.eth.getBlockNumber();
        this.closed = false;
        this.lastBlock = await this.web3.eth.getBlock(n-1, true);
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
            let subCallback = async (block) => {
                if(block) {
                    log.debug("incoming block", block.number);
                    this.emit("block", block)
                }
            };

            log.info("Starting subscription for new blocks");
            this.sub = this.web3.eth.subscribe('newBlockHeaders');
            this.sub.on("data", subCallback);
        }
    }

    on(evt, listener) {
        if(this.closed) {
            throw new Error("Attemptng to subscribe after closed");
        }
        super.on(evt,listener)
    }

    async close() {
        this.closed = true;
        if(!this.needsPolling) {
            await this.web3.eth.clearSubscriptions();
        } else if(this.poller) {
            await this.poller.stop();
        }
    }

    setupPoller() {
        log.info("Will use polling for new blocks since using HTTP provider");
        this.poller = new Poller(this, this.maxRetries, this.lastBlock, (block,e)=>{
            if(e) {
                log.error("Getting error in poll", e);
                this.emit("error", e);
            } else if(block) {
                log.info("Getting block from poller", block.number);
                this.lastBlock = block;
                this.emit("block", block);
            }
        });
        return this.poller.start();
    }

    async transactions(block) {
        if(block.transactions && block.transactions.length > 0) {
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
            let r = await execWithRetries(ctx, this.web3.eth.getTransactionReceipt, txn.hash);
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
            try {
                log.debug("Sending first block to callback", this.lastBlock.number);
                this.callback(this.lastBlock);
            } catch (e) {
                return err(e);
            }
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
                    await this._doPoll(ctx);
                    let next = 5000 - (Date.now()-s);
                    if(next < 0) {
                        next = 5000;
                    }
                    ctx.sleepTime = next;
                    log.debug("Sleeping", ctx.sleepTime,"ms before next poll");
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
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }

    async _doPoll(ctx) {
        let block = await execWithRetries(ctx, this.connector.web3.eth.getBlock, this.lastBlock.number+1, true);
        if(block && block.number !== this.lastBlock.number) {
            this.lastBlock = block;
            this.callback(block);
        } else {
            log.debug("Block number is same as last block");
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
                log.debug("Problem getting next block", e);
                if(ctx.tries > ctx.maxRetries) {
                   return err(e)
                } else {
                    log.debug("Pausing and will try again...")
                    await sleep(1000);
                }
            }
        }
    });
}