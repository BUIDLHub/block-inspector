/**
 * Aggregates global number of transactions received
 */
import {Logger} from 'bi-utils';;
import {Time} from 'bi-utils';
import {Handler} from 'bi-block-router';
import * as DBNames from '../DBNames';
import _ from 'lodash';

const GLOBAL_CNT = "_globalTxnCount";
const MIN_CNT = "_txnCountByMinute";
const log = new Logger({component: "TxnCounts"});

export default class TxnCounts extends Handler {
    constructor() {
        super("TxnCountsAnalytic");
        this.totalCnt = {total: 0};
        this.byMinute = {};
        [
            'init',
            'newBlock',
            'purgeBlocks'
        ].forEach(fn=>this[fn]=this[fn].bind(this));
    }

    async init(ctx, next) {
        let ex = await ctx.db.read({
            database: DBNames.Analytics,
            key: GLOBAL_CNT
        });

        let mins = await ctx.db.read({
            database: DBNames.Analytics,
            key: MIN_CNT
        });
        if(ex) {
            this.totalCnt = {
                ...ex
            }
        }
        if(mins) {
            this.byMinute = {
                ...mins
            }
        }
        return next();
    }

    async newBlock(ctx, block, next) {
        let ex = {
            ...this.totalCnt
        }
        ex.total += block.transactions.length;
       
        log.debug("Existing counts", ex);
        let min = Time.normalizeToMinute(block.timestamp);
        let mins = {
            ...this.byMinute
        }
        log.debug("Existing minute blocks", mins);
        let minCnt = mins[min] || 0;
        minCnt += block.transactions.length;
        mins[min] = minCnt;
        this.byMinute = mins;
        this.totalCnt = ex;
        
        ctx.aggregations.put(GLOBAL_CNT, ex);
        ctx.aggregations.put(MIN_CNT, mins);
        return next();
    }

    async purgeBlocks(ctx, blocks, next) {
        let ex = {
            ...this.totalCnt
        }
       
        let mins = {
            ...this.byMinute
        }

        if(ctx.blocks) {
            ex.total = 0;
            let newMins = {};
            ctx.blocks.forEach(b=>{
                ex.total += b.transactions.length;
                let min = Time.normalizeToMinute(b.timestamp);
                let minCnt = newMins[min] || 0;
                minCnt += b.transactions.length;
                newMins[min] = minCnt;
            });
            mins = newMins;
        } else {
            blocks.forEach(b=>{
                ex.total -= b.transactions.length;
                if(ex.total < 0) {
                    ex.total = 0;
                }
    
                let min = Time.normalizeToMinute(b.timestamp);
                let minCnt = mins[min] || 0;
                minCnt -= b.transactions.length;
                if(minCnt <= 0) {
                    delete mins[min];
                } else {
                    mins[min] = minCnt;
                }
            });
        }
        _.keys(mins).forEach(m=>{
            let v = mins[m];
            if(!v) {
                delete mins[m];
            }
        });

        this.totalCnt = ex;
        this.byMinute = mins;
        ctx.aggregations.put(GLOBAL_CNT, ex);
        ctx.aggregations.put(MIN_CNT, mins);
        return next();
    }
}