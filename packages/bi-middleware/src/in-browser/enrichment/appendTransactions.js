
/**
 * Route handler that appends transactions to blocks if not already there
 */
export default async function(ctx, block, next) {
    if(!block.transactions || block.transactions.length === 0) {
        let txns = await ctx.web3.transactions(block);
        block.transactions = txns;
    }
    next();
}