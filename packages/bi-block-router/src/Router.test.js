import Web3 from 'bi-web3';
import Router from './';

describe("Router", ()=>{
    it("should send block through registered handlers", done=>{
        let h1Res = {
            hit: false,
            error: null
        }
        let h2Res = {
            hit: false,
            error: null
        }

        let  h1 = async (ctx, block, next) => {
            h1Res.hit = true;
            ctx.passThrough = true;
            block._addedObject = {
                content: "something"
            }
            return next();
        }

        let h2 = async (ctx, block, next) => {
            h2Res.hit = true;
            if(!ctx.passThrough) {
                h2Res.error = "Missing context pass through";
            }
            let obj = block._addedObject;
            if(!obj) {
                h2Res.error = "Missing object appended to block";
            }
            if(!obj.content) {
                h2Res.error = "Missing object property added to block";
            }
            return next();
        }
        let web3 = new Web3();
        let router = new Router({web3, config: web3.config})
        router.use(h1);
        router.use(h2);
        web3.start().then(async ()=>{
            await sleep(1000);
            await web3.stop();
            if(!h1Res.hit) {
                return done(new Error("First handler never received block"));
            }
            if(h1Res.error) {
                return done(h1Res.error);
            }
            if(!h2Res.hit) {
                return done(new Error("Second handler never received block"));
            }
            if(h2Res.error) {
                return done(h2Res.error);
            }
            done();
        })
    }).timeout(15000);
});

const sleep = ms => {
    return new Promise(done=>{
        setTimeout(done, ms);
    })
}