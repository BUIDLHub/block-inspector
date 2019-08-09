import Con from './Connector';
import Connector from './Connector';
import Config from 'bi-config';

describe("Connector", ()=>{
    it("should connect and get current block", done=>{
        let cfg = Config.create();
        
        let con = new Connector(cfg.network)
        
        con.open().then(async ()=>{
            try {
                let b = await con.currentBlock();
                console.log("Current block", b.number);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    
    it("should get block from subscription", done=>{
        let con = new Connector(Config.create().network);
        con.open().then(()=>{
            con.on("block", async block=>{
                console.log("Received block", block.number);

                await con.close();
                done();
            })
            con.startBlockSubscription();
        })
    }).timeout(30000);

    it("should get transactions for block", done=>{
        let con = new Connector(Config.create().network);
        con.open().then(async ()=>{
            let b = await con.currentBlock();
            let txns = await con.transactions(b);
            if(!txns || txns.length === 0) {
                done(new Error("Expected txns for block"));
            } else {
                console.log("Block", b.number,'has',txns.length,"txns");
                done();
            }
        })
    });

    it("should get transaction receipt", done=>{
        let con = new Connector(Config.create().network);
        con.open().then(async ()=>{
            let b = await con.currentBlock();
            let txns = await con.transactions(b);
            if(txns && txns.length > 0) {
                let r = await con.receipt(txns[0]);
                if(!r || typeof r.status === 'undefined') {
                    done(new Error("Could not get valid receipt for txn: " + txns[0].hash));
                } else {
                    console.log("Receipt for hash", txns[0].hash, r.gasUsed);
                    done();
                }
            } else {
                done();
            }
        })
    });
    
});

