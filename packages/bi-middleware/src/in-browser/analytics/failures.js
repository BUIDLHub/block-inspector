import {Handler} from 'bi-block-router';
import * as DBNames from '../DBNames';

/**
 * Aggregations failed txn counts
 */
const FAIL_CNT = "_failures";

export default class Failures extends Handler {
    constructor() {
        super("FailureAggregations");
        this.failures = { total: 0 };
        [
            'init',
            'newBlock',
            'purgeBlocks'
        ].forEach(fn=>this[fn]=this[fn].bind(this));
    }

    async init(ctx, next) {
        let f = await ctx.db.read({
            database: DBNames.Analytics, 
            key: FAIL_CNT
        });
        if(f) {
            this.failures = f;
        }
        return next();
    }

    async newBlock(ctx, block, next) {
        let cnt = countFailures(block);
        let ex ={
            ...this.failures
        }
        ex.total += cnt;
        this.failures = ex;
        ctx.aggregations.put(FAIL_CNT, ex);
        return next();
    }

    async purgeBlocks(ctx, blocks, next) {
        let ex = {
            ...this.failures
        }

        blocks.forEach(b=>{
            let cnt = countFailures(b);
            ex.total -= cnt;
        })
        if(ex.total < 0) {
            //have to start over
            let all = ctx.blocks || [];
            ex.total = 0;
            all.forEach(b=>{
                ex.total += countFailures(b);
            })
        }
        this.failures = ex;
        ctx.aggregations.put(FAIL_CNT, ex);
        return next();
    }
}

const countFailures = block => {
    let cnt = block.transactions.reduce((c, t)=>{
        let r = t.receipt;
        if(r) {
            let stat = r.status;
            if(!stat) {
                return c + 1;
            }
        }
        return c;
    },0);
    return cnt;
}