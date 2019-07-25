/**
 * Increments total gas usage based on all txns in a block
 */
import {Logger} from 'bi-utils';

const log = new Logger({component: "GasTracker"});

 const GLOBAL_GU_KEY = "_globalGasUsed";

 const getGasUsed = block => {
    let totalGU = block.gasUsed;
    if(totalGU.toString) {
        totalGU = (totalGU.toString(10)-0);
    } else {
        totalGU -= 0;
    }
    return totalGU;
 }

 export default async function(ctx, block) {
    let totalGU = getGasUsed(block);
    let ex = await ctx.aggregations.get(GLOBAL_GU_KEY);
    if(!ex) {
        ex = {total: 0}
    }
    log.debug("Existing record", ex);
    log.debug("Current total", totalGU);
    ctx.aggregations.put(GLOBAL_GU_KEY, {total: (ex.total-0) + (totalGU-0)});
 }

 export const remove = async (ctx, block) => {
    let ex = await ctx.aggregations.get(GLOBAL_GU_KEY);
    if(!ex) {
        return;
    }
    let totalGU = getGasUsed(block);
    ctx.aggregations.put(GLOBAL_GU_KEY, {total: (ex.total-0) - (totalGU-0)});
 }