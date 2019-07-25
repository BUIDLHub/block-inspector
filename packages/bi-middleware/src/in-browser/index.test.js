import InBrowser from './';
import Web3 from 'bi-web3';
import Router from 'bi-block-router';
import * as DBNames from './DBNames';
import Config from 'bi-config';

const runTest = async (handler,lastStep, timeout=1000) => {
    let cfg = Config.create();
    cfg = new Config({
        ...cfg,
        network: {
            ...cfg.network,
            URL: "https://mainnet.infura.io/v3/e0a0a746fae345089d1c9c9870a80bd2"
        },
        storage: {
            ...cfg.storage,
            maxBlocks: 1
        }
    });
    let web3 = new Web3(cfg);
    let router = new Router({web3, config: cfg});
    let inBrowser = new InBrowser();
    
    return inBrowser.init({web3,router, handler}).then(()=>{
        
        if(lastStep) {
            router.use(lastStep);
        }
        
        return web3.start().then(async ()=>{
            await sleep(timeout);
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
        runTest(handler, last);
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
        runTest(handler, last)
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
    })

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
});

const sleep = ms => {
    return new Promise(done=>{
        setTimeout(done, ms)
    })
}