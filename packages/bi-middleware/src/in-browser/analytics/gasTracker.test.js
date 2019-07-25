import Web3 from 'bi-web3';
import gasTracker from './gasTracker';

describe("GasTracker", ()=>{
    it("should increment gas count based on transactions", done=>{
        let web3 = new Web3();
        let conn = web3.connector;
        conn.open().then(async ()=>{
            await conn.close();
            let startGas = conn.web3.utils.toBN("45678");
            let txnGas = conn.web3.utils.toBN("21000");
            let endGas = startGas.add(txnGas);
            let aggs = {
                _globalGasUsed: {total: startGas.toString(10)}
            };
            let ctx = {
                aggregations: {
                    put: (key, val) => {
                        aggs[key] = val;
                    },
                    get: (key) => {
                        return aggs[key]
                    }
                }
            }
            let block = {
                gasUsed: txnGas
            };

            await gasTracker(ctx, block);
            let total = aggs._globalGasUsed.total-0;
            let expected = endGas.toString()-0;
            if(total !== expected) {
                return done(new Error("Expected: " + expected + " but total was: " + total));
            }
            done();
        });
    });
});