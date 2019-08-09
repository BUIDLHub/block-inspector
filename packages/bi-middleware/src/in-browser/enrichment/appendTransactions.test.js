import Web3 from 'bi-web3';
import Handler from './appendTransactions';
import Config from 'bi-config';

describe("AppendTransactions", ()=>{
    it("should append block transactions if not present", done=>{
        let cfg = Config.create();
        
        let web3 = new Web3(cfg);
        let conn = web3.connector;
        conn.open().then(async ()=>{
            let b = await conn.currentBlock();
            let ctx = {
                web3: conn
            };
            let next = async () => {
                await conn.close();
                if(!b.transactions || b.transactions.length === 0) {
                    return done(new Error("Missing block transactions"));
                }
                done();
            }
            let h = new Handler();
            h.newBlock(ctx, b, next);
        })
    });
});