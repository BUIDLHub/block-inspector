/**
 * Aggregates global number of transactions received
 */
import {Logger} from 'bi-utils';;
import {Time} from 'bi-utils';

const GLOBAL_CNT = "_globalTxnCount";
const MIN_CNT = "_txnCountByMinute";
const log = new Logger({component: "TxnCounts"});
export default async function(ctx, block) {
    let ex = await ctx.aggregations.get(GLOBAL_CNT);

    if(!ex) {
        ex = {total: 0}
    }
    log.debug("Existing counts", ex);
    let min = Time.normalizeToMinute(block.timestamp);
    let mins = await ctx.aggregations.get(MIN_CNT);
    if(!mins) {
        mins = {};
    }
    log.debug("Existing minute blocks", mins);
    let minCnt = mins[min] || 0;
    minCnt += block.transactions.length;
    mins[min] = minCnt;
    ctx.aggregations.put(GLOBAL_CNT, {total: ex.total + block.transactions.length});
    ctx.aggregations.put(MIN_CNT, mins);
}

export const remove = async (ctx, block) => {
    let ex = await ctx.aggregations.get(GLOBAL_CNT);
    let mins = await ctx.aggregations.get(MIN_CNT);
    if(!ex) {
        return;
    }
   
    if(!mins) {
       return;
    }

    let min = Time.normalizeToMinute(block.timestamp);
    let minCnt = mins[min];
    if(!minCnt) {
        return;
    }
    minCnt -= block.transactions.length;
    mins[min] = minCnt;
    ctx.aggregations.put(GLOBAL_CNT, {total: ex.total - block.transactions.length});
    ctx.aggregations.put(MIN_CNT, mins);
}