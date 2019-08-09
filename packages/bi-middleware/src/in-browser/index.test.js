import InBrowser from './';
import Web3 from 'bi-web3';
import {Router,Handler} from 'bi-block-router';
import * as DBNames from './DBNames';
import Config from 'bi-config';


class TestHandler extends Handler {
    constructor(fn) {
        super("TestHandler")
        this.handler = fn;
        [
            'init',
            'newBlock',
            'purgeBlocks'
        ].forEach(fn=>this[fn]=this[fn].bind(this))
    }

    async init(ctx, next) {
        return next();
    }

    async newBlock(ctx, block, next) {
        return this.handler(ctx, block, next);
    }

    async purgeBlocks(ctx, blocks, next) {
        return next();
    }
}

const runTest = async (handler,lastStep, timeout=1000) => {
    let cfg = Config.create();
    cfg = new Config({
        ...cfg,
        network: {
            ...cfg.network,
            //URL: "http://localhost:8545/"
            URL: "https://mainnet.infura.io"
        },
        storage: {
            ...cfg.storage,
            maxBlocks: 2
        }
    });
    let web3 = new Web3(cfg);
    let router = new Router({web3, config: cfg});
    let inBrowser = new InBrowser();
    
    return inBrowser.init({web3,router, handler}).then(()=>{
        console.log("Initialized middleware, starting web3...");
        
        if(lastStep) {
            router.use(new TestHandler(lastStep));
        }
        
        return web3.start().then(async ()=>{
            console.log("Web3 started, waiting for", timeout,'ms');
            await sleep(timeout);
            console.log("Test timeout expired, stopping web3");
            await web3.stop();
            return inBrowser;
        });
        
    });
}

describe("InBrowser", ()=>{

    
    it("should route blocks through handlers and produce stored output", done=>{
        let handler = (block) => {
            console.log("Finished block", block.number);
        }
        let error = null;
        let finished = false;
        let last = async (ctx, block, next) => {
            console.log("Running last handler to check results");
            let db = ctx.db;
            finished = true;
            if(!db) {
                error = new Error("Expected DB to be attached to router context");
                return next();
            }
            let val = await db.read({
                database: DBNames.Analytics,
                key: "_globalGasUsed"
            });
            if(!val || !val.total) {
                error = new Error("Expected aggregated gas used value stored in DB");
                return next();
            }
            return next();
        }
        runTest(handler, last, 15000);
        let loopFn = () => {
            return new Promise(async _done=>{
                while(!finished) {
                    await sleep(1000);
                }
                _done();
            });
        }
        loopFn().then(()=>{
            done(error);
        }).catch(done);

    }).timeout(20000);

    

    it("should be able to read analytic values from DB", done=>{
        let finished = false;
        let last = (ctx, block, next) => {
            finished = true;
            next();
        }
        let handler = block => {};
        runTest(handler, last, 15000)
        .then(async (inBrowser)=>{
            let vals = await inBrowser.analytics();
            if(!vals._globalTxnCount) {
                return done(new Error("Expected to have transactions"));
            }
            if(!vals._globalTxnCount.total) {
                return done(new Error("Expected to have a total for global transaction count"));
            }
            done();
        })
        .catch(done);
    }).timeout(30000)


    /*
    it("should recover block range and purge appropriately", done=>{
        let blocks = [];
        let db = null;
        let last = (ctx, block, next) => {
            db = ctx.db;
            console.log("Getting block at last step");
            blocks.push(block);
            return next();
        }
        let cfg = Config.create();
        cfg = new Config({
            ...cfg,
            network: {
                ...cfg.network,
                URL: "http://localhost:8545/"
            },
            storage: {
                ...cfg.storage,
                maxBlocks: 2
            }
        });
        let web3 = new Web3(cfg);
        let router = new Router({web3, config: cfg});
        let inBrowser = new InBrowser();
        inBrowser.init({web3, config: cfg, router}).then(async ()=>{
            router.use(new TestHandler(last));
            let range = await inBrowser.recoveryBlockRange();
            let diff = range.toBlock-range.fromBlock;
            if(diff === 0) {
                return done(new Error("Range seems wrong for recovery", range));
            }
            ++diff; //add one since range is inclusive of 'toBlock'
            await inBrowser.recover(range);
            if(blocks.length !== diff) {
                return done(new Error("Expected: " + diff +" blocks to be recovered but found: " + blocks.length));
            }
            let newRange = await inBrowser.recoveryBlockRange();
            while(newRange.toBlock == range.toBlock) {
                console.log("Current block hasn't changed yet...waiting for next block", newRange.toBlock, range.toBlock);
                await sleep(1000);
                newRange = await inBrowser.recoveryBlockRange();
            }
            //now we recover again and we should purge earliest block
            blocks = [];
            await inBrowser.recover(newRange);
            if(blocks.length !== 1) {
                return done(new Error("Second recovery did not get expected blocks: " + blocks.length + " != 1"));
            }
            //db should not have block
            if(!db) {
                return done(new Error("Context did not have a db ref"));
            }
            let b = await db.read({
                database: DBNames.Blocks,
                key: ""+range.fromBlock
            });
            if(b) {
                console.log("Found block", b);
                return done(new Error("Should have purged block outside of max range: " + range.fromBlock));
            }

            done();
        });

    }).timeout(60000);

    
    it("should update with new blocks", done=>{
        let finished = false;
        let count = 0;
        let last = (ctx, block, next) => {
            ++count;
            if(count > 1) {
                finished = true;
            }
            console.log("Getting block", block.number);
            next();
        }
        runTest(()=>{},last, 15000).then(async (inBrowser)=>{
            if(count < 2) {
               return done(new Error("Expected to get a block in time"));
            }
            let vals = await inBrowser.analytics();
            if(!vals._globalTxnCount) {
                return done(new Error("Expected to have transactions"));
            }
            if(!vals._globalTxnCount.total) {
                return done(new Error("Expected to have a total for global transaction count"));
            }
            console.log("Analytics", vals);
            done();
        }).catch(done);
    }).timeout(40000);
    */
    
    
});

const sleep = ms => {
    return new Promise(done=>{
        setTimeout(done, ms)
    })
}