/**
 * Aggregates info specific to blocks
 */
const BLOCK_KEY = "_blockStats";
export default async function(ctx, block) {
    let callCnt = block.transactions.reduce((c, t)=>{
        if(t.input.length > 2) {
            return c + 1;
        }
        return c;
    }, 0);
    let valCnt = block.transactions.length - callCnt;
    let ex = await ctx.aggregations.get(BLOCK_KEY);
    if(!ex) {
        ex = {};
    }
    ex[block.number] = {
        contractCalls: callCnt,
        valueXfers: valCnt
    };
    ctx.aggregations.put(BLOCK_KEY, ex);
}

export const remove = async (ctx, block) => {
    let ex = await ctx.aggregations.get(BLOCK_KEY);
    if(!ex) {
        return;
    }
    ex = {
        ...ex
    }
    delete ex[block.number];
    ctx.aggregations.put(BLOCK_KEY, ex);
}