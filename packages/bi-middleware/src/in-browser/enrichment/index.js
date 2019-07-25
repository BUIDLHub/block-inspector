import appendTxns from './appendTransactions';
import appendRcpts from './appendReceipts';

const handlers = [
    appendTxns,
    appendRcpts
];

export default async function(ctx, block, next) {
    let idx = 0;
    let _next = async () => {
        ++idx;
        if(idx >= handlers.length) {
            return next();
        }
        let h = handlers[idx];
        await h(ctx, block, _next);
    }
    await handlers[0](ctx, block, _next);
}