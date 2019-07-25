/**
 * Aggregations failed txn counts
 */
const FAIL_CNT = "_failures";
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

export default async function(ctx, block) {
    let cnt = countFailures(block);
    let ex = await ctx.aggregations.get(FAIL_CNT);
    if(!ex) {
        ex = {total: 0}
    }
    ctx.aggregations.put(FAIL_CNT, {total: ex.total + cnt});
}

export const remove = async (ctx, block) => {
    let ex = await ctx.aggregations.get(FAIL_CNT);
    if(!ex) {
        return;
    }
    let cnt = countFailures(block);
    ctx.aggregations.put(FAIL_CNT, {total: ex.total - cnt});
}