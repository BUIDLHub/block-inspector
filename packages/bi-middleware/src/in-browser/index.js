import DB from 'bi-storage';
import {Router,Handler} from 'bi-block-router';
import Analytics from './analytics';
import Enrichment from './enrichment';
import * as yup from 'yup';
import * as DBNames from './DBNames';
import {Logger} from 'bi-utils';
import EventEmitter from 'events';
import {Mutex} from 'async-mutex';

const schema = yup.object({
    web3: yup.object().required("Missing web3 for InBrowser middleware")
})
const log = new Logger({component: "InBrowserMiddleware"});
var dbsByNetwork = {};
const _analytics = new Analytics();
const _enrichment = new Enrichment();
const mutex = new Mutex();

const getDB = async (netId) => {
    if(!netId) {
        throw new Error("Attempting to get DB without network id");
    }
    let db = dbsByNetwork[netId];
    let release = await mutex.acquire();
    if(!db) {
        
        db = new DB({
            dbPrefix: 'bi-' + netId + "-"
        });
        dbsByNetwork[netId] = db;
        log.info("Creating DB instance for network", netId)
    }
    release();
    return db;
}

export default class InBrowser extends EventEmitter {
    constructor() {
        super();
       
        [
            'init',
            'readCachedBlocks',
            'recoveryBlockRange',
            'recover',
            'currentBlock',
            'analytics',
            'changeNetwork',
            'blocks'
        ].forEach(fn=>this[fn]=this[fn].bind(this));
    }

    async init(props) {
        schema.validateSync(props);
        
        this.web3 = props.web3;
        this.config = props.config || props.web3.config;
        
        if(!this.config) {
            throw new Error("Need to have master configuration settings for middleware");
        }
        dbsByNetwork = {};
        await this.web3.open();
        this.networkId = await this.web3.networkId();
        this.router = props.router || new Router({web3:this.web3, config: this.config});
        this.router.use(new AttachDB(this.networkId));
        this.router.use(new AddBlocks());
        this.router.use(_enrichment, "enrichment");
        this.router.use(_analytics, "analytics");
        this.router.use(new BlockHandler(this));
        await this.router.init();
    }

    async readCachedBlocks() {
        let db = await getDB(this.networkId);
        return await db.readAll({
            database: DBNames.Blocks,
            sort: [
                {
                    field: "number",
                    order: "DESC"
                }
            ]
        })
    }

    //recoveryBlockRange gets the range of blocks needed to catch up from the last read block 
    //to the current block
    async recoveryBlockRange() {
        let db = await getDB(this.networkId);
        let current = await this.currentBlock(true); //forces read of current block
        let knownBlocks = await db.readAll({
            database: DBNames.Blocks,
            sort: [{
                field: "number",
                order: "DESC"
            }]
        });
        log.debug("All blocks in DB", knownBlocks.map(b=>b.number));
        current = current.number-0;
        let last = knownBlocks[0];
        if(!last) {
            last = current;
        } else {
            last = last.number-0;
        }
        

        let diff = current-last;
        let max = this.config.storage.maxBlocks-0;
        if(diff === 0 || diff > max) {
            last = (current - max);
        } 
        if(last < 0) {
            last = 0;
        }
        return {
            fromBlock: last+1,//we add 1 since we've either already seen the last block or it's current-max, but we include current in total so we need to subtract that from total
            toBlock: current
        }
    }

    //recover retrieves block range and forwards to router's onBlock function to handle data
    async recover(range) {
        let netId = await this.web3.networkId();
        let db = await getDB(netId);

        log.debug("Recovering blocks: ", range);

        //first, we have to purge anything that falls outside of the allowed storage range. Basically,
        //we take the end range, subtract max, and purge anything older than that number.
        let minBlock = range.toBlock - this.config.storage.maxBlocks;

        log.debug("Filtering out any block at or before", minBlock);

        let blocks = await db.readAll({
            database: DBNames.Blocks,
            filterFn: (v,k,i) => {
                let num = k-0;
                log.debug("Comparing key", num, "to", minBlock);
                if(num <= minBlock) {
                    return true;
                }
                return false;
            },
            sort: [
                {
                    field: "timestamp",
                    order: "ASC"
                }
            ]
        });
        log.debug("Purging", blocks.length, "blocks that are out of range");
        await this.router.purgeBlocks(blocks);

        log.debug("Retrieving new blocks from web3");
        return this.web3.getBlockRange(range, this.router.newBlock)
    }

    async changeNetwork(web3) {
        if(this.web3) {
           await this.web3.stop();
        }
        this.web3 = web3;
        this.networkId = await web3.networkId();
        if(!this.networkId) {
            throw new Error("Failed to change web3 network. Missing network id");
        }
    }

    async currentBlock(force) {
        return this.web3.currentBlock(force);
    }

    async analytics() {
        if(!this.networkId) {
            this.networkId = await this.web3.networkId();
            if(!this.networkId) {
                throw new Error("No network id when getting analytics");
            }
            
        }
        let db = await getDB(this.networkId);
        return _analytics.readFromDB(db);
    }

    async blocks(range) {
        if(!this.networkId) {
            this.networkId = await this.web3.networkId();
            if(!this.networkId) {
                throw new Error("No network id when getting analytics");
            }
            
        }
        let db = await getDB(this.networkId);
        return await db.readAll({
            database: DBNames.Blocks
        });
    }
}

class AttachDB extends Handler {
    constructor(networkId) {
        super("AttachDB");
        this.networkId = networkId;
        [
            'init',
            'newBlock',
            'purgeBlocks'
        ].forEach(fn=>this[fn]=this[fn].bind(this));
    }

    async init(ctx, next) {
        let db = await getDB(this.networkId);
        ctx.db = db;
        ctx.networkId = this.networkId;
        return next();
    }

    async newBlock(ctx, block, next) {
        let netId = this.networkId;
        if(block.networkId) {
            netId = block.networkId;
            ctx.networkId = netId;
        }
        
        let db = await getDB(netId);
        ctx.db = db;
        return next();
    }

    async purgeBlocks(ctx, blocks, next) {
        let netId = this.networkId;
        if(blocks.length > 0) {
           netId = blocks[0].networkId;
           ctx.networkId = netId;
        }
        
        let db = await getDB(netId);
        ctx.db = db;
        return next();
    }

}

class AddBlocks extends Handler {
    constructor() {
        super("AddBlocks");
        this._blocks = [];
        [
            'init',
            'newBlock',
            'purgeBlocks'
        ].forEach(fn=>this[fn]=this[fn].bind(this));
    }

    async init(ctx, next) {
        let blocks = await ctx.db.readAll({
            database: DBNames.Blocks,
            limit: 1000,
            sort: [
                {
                    field: "number",
                    order: "ASC"
                }
            ]
        });
        log.info("Initialized middleware with", blocks.length,"blocks from DB");
        this._blocks = blocks;
        ctx.blocks = blocks;
        return next();
    }

    async newBlock(ctx, block, next) {
        this._blocks.push(block);
        
        log.info("Getting new block in middleware with number:", block.number, "and cache size:", this._blocks.length,"and max storage capacity:", ctx.config.storage.maxBlocks);
        try {
             if(this._blocks.length > ctx.config.storage.maxBlocks) {
                this._blocks.shift();
            }
            ctx.blocks = this._blocks;
        } catch (e) {
            log.error("Problem calling block handler", e);
        }
        return next();
    }

    async purgeBlocks(ctx, blocks, next) {
        let newBlocks = this._blocks.filter(b=>{
            let idx = -1;
            for(let i=0;i<blocks.length;++i) {
                let removed = blocks[i];
                if(removed.number === b.number) {
                    idx = i;
                    break;
                }
            }
            return idx < 0;
        });
        ctx.blocks = newBlocks;
        this._blocks = newBlocks;
        return next();
    }
}

class BlockHandler extends Handler {
    constructor(emitter) {
        super("BlockHandler");
        this._blocks = [];
        this.emitter = emitter;
        [
            'init',
            'newBlock',
            'purgeBlocks'
        ].forEach(fn=>this[fn]=this[fn].bind(this));
    }

    async init(ctx, next) {
        this._blocks = ctx.blocks;
        return next();
    }

    async newBlock(ctx, block, next) {
        this._blocks.push(block);
        
        log.info("Getting new block in middleware with number:", block.number, "and cache size:", this._blocks.length,"and max storage capacity:", ctx.config.storage.maxBlocks);
        try {
             if(this._blocks.length > ctx.config.storage.maxBlocks) {
           
                let lowest = this._blocks.shift();
                log.info("Removing earliest block", lowest.number, "since we've exceeded max", ctx.config.storage.maxBlocks);
                await this.purgeBlocks(ctx, [lowest], ()=>{});
                this.emitter.emit("blockRemoved", lowest);
            }
        
            await ctx.db.create({
                database: DBNames.Blocks,
                key: ""+block.number,
                data: block
            });
            this.emitter.emit("block", block);
        } catch (e) {
            log.error("Problem calling block handler", e);
        }
        return next();
    }

    async purgeBlocks(ctx, blocks, next) {
        let newBlocks = this._blocks.filter(b=>{
            let idx = -1;
            for(let i=0;i<blocks.length;++i) {
                let removed = blocks[i];
                if(removed.number === b.number) {
                    idx = i;
                    break;
                }
            }
            return idx < 0;
        });
        ctx.blocks = newBlocks;
        await _analytics.purgeBlocks(ctx, blocks, ()=>{});
        await _enrichment.purgeBlocks(ctx, blocks, ()=>{});
        for(let i=0;i<blocks.length;++i) {
            let b = blocks[i];
            await ctx.db.remove({
                database: DBNames.Blocks,
                key: ""+b.number
            })
        }
        this._blocks = newBlocks;
        return next();
    }
}
