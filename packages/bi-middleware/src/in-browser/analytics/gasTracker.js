/**
 * Increments total gas usage based on all txns in a block
 */
import {Logger} from 'bi-utils';
import {Handler} from 'bi-block-router';
import * as DBNames from '../DBNames';
import blockStats from '../../../dist/in-browser/analytics/blockStats';

const log = new Logger({component: "GasTracker"});

 const GLOBAL_GU_KEY = "_globalGasUsed";

 export default class GasTracker extends Handler {
     constructor() {
         super("GasTrackerAnalytic");
         this.totalGas = {total: 0};
         [
             'init',
             'newBlock',
             'purgeBlocks'
         ].forEach(fn=>this[fn]=this[fn].bind(this));
     }

     async init(ctx, next) {
         log.debug("Initializing gas tracker...");
        let ex = await ctx.db.read({
            database: DBNames.Analytics,
            key: GLOBAL_GU_KEY
        });
        log.debug("Existing total gas", ex);
        if(ex) {
            this.totalGas = {
                total: ex.total-0
            }
        }
        return next();
     }

     async newBlock(ctx, block, next) {
        let totalGU = getGasUsed(block);
        log.debug("Incoming gas total", totalGU);
        let ex = {
            ...this.totalGas
        }
        ex.total += (totalGU-0);
        
        log.debug("New gas total", ex.total);
        this.totalGas = ex;
        ctx.aggregations.put(GLOBAL_GU_KEY, ex);
        return next();
     }

     async purgeBlocks(ctx, blocks, next) {
        let ex = {
            ...this.totalGas
        }
        blocks.forEach(b=>{
            let totalGU = getGasUsed(b);
            ex.total -= (totalGU)-0;
        })
        if(ex.total < 0) {
            //something's off, reset
            let blocks = ctx.blocks || [];
            ex.total = 0;
            blocks.forEach(b=>{
                let gu = getGasUsed(b);
                ex.total += gu-0;
            });
        }
        this.totalGas = ex;
        ctx.aggregations.put(GLOBAL_GU_KEY,ex);
        return next();
     }
 }

 const getGasUsed = block => {
    let totalGU = block.gasUsed;
    if(totalGU.toString) {
        totalGU = (totalGU.toString(10)-0);
    } else {
        totalGU -= 0;
    }
    return totalGU;
 }