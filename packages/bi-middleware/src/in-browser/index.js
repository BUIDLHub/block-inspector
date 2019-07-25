import DB from 'bi-storage';
import Router from 'bi-block-router';
import Analytics from './analytics';
import enrichment from './enrichment';
import * as yup from 'yup';
import * as DBNames from './DBNames';
import {Logger} from 'bi-utils';
import EventEmitter from 'events';

const schema = yup.object({
    web3: yup.object().required("Missing web3 for InBrowser middleware")
})
const log = new Logger({component: "InBrowserMiddleware"});
const db = new DB();
const _analytics = new Analytics();
export default class InBrowser extends EventEmitter {
    constructor() {
        super();
        this._blocks = [];

        [
            'init',
            'currentBlock',
            'analytics',
            'blocks'
        ].forEach(fn=>this[fn]=this[fn].bind(this));
    }

    async init(props) {
        schema.validateSync(props);
        
        let attachDB = async (ctx, block, next) => {
            ctx.db = db;
            return next();
        }

        //We clear out all history at startup. This could be changed but makes it more complicated 
        //to track a window of time at initialization (aggregation counts would have to updated with 
        //trimmed set of blocks/transactions, etc)
        await db.clearAll(Object.keys(DBNames));
        await _analytics.init();

        this.web3 = props.web3;
        this.router = props.router || new Router({web3});
        this.router.use(attachDB);
        this.router.use(enrichment);
        this.router.use(_analytics.exec);
        this.router.use(async (ctx, block, next)=>{
            this._blocks.push(block);
            if(this._blocks.length > ctx.config.storage.maxBlocks) {
               
                let lowest = this._blocks.shift();
                log.debug("Removing earliest block", lowest.number, "since we've exceeded max", ctx.config.storage.maxBlocks);
                await _analytics.removeFromDB(ctx, lowest);
                await ctx.db.remove({
                    database: DBNames.Blocks,
                    key: ""+lowest.number
                });
                this.emit("blockRemoved", lowest);
            }
            try {
                await ctx.db.create({
                    database: DBNames.Blocks,
                    key: ""+block.number,
                    data: block
                });
                this.emit("block", block);
            } catch (e) {
                log.error("Problem calling block handler", e);
            }
            next();
        })
    }

    async currentBlock() {
        return this.web3.currentBlock();
    }

    async analytics() {
        return _analytics.readFromDB(db);
    }

    async blocks(range) {
        
    }
}