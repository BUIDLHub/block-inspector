import GasTracker from './gasTracker';
import TxnCount from './txnCount';
import Failures from './failures';
import BlockStats from './blockStats';
import _ from 'lodash';
import * as DBNames from '../DBNames';
import {Logger} from 'bi-utils';
import {Handler} from 'bi-block-router'

/**
 * Runs blocks through a series of aggregation functions that track counts, etc. Then when all are done, 
 * aggregation data is stored in Analytics DB.
 */

 const blockStats = new BlockStats();
 const txnCount = new TxnCount();
 const failures = new Failures();
 const gasTracker = new GasTracker();

 const analytics = [
     gasTracker,
     txnCount,
     failures,
     blockStats
 ];

 const log = new Logger({component: "AnalyticsHandler"});

 export default class Analytics extends Handler {
     constructor() {
         super("AnalyticsHandler");
         [
             'init',
             'newBlock',
             'purgeBlocks',
             'readFromDB'
         ].forEach(fn=>this[fn]=this[fn].bind(this));
     }

     async init(ctx, next) {
         for(let i=0;i<analytics.length;++i) {
             let a = analytics[i];
             await a.init(ctx, ()=>{});
         }
         return next();
     }

    async newBlock(ctx, block, next) {
        let dbCache = {};
        let aCtx = {
            ...ctx,
            aggregations: {
                put: (key, val) => {
                    log.debug("Adding aggregation with key", key, val);
                    dbCache[key] = val;
                }
            }
        }
        
        log.debug("Running through", analytics.length,"aggregators");
        let calls = [];
        analytics.forEach(a=>{
            calls.push(a.newBlock(aCtx,block, ()=>{}));
        });
        
        await Promise.all(calls);
        let aggNames = _.keys(dbCache);
        log.debug("Aggregation keys", aggNames);
        let updates = aggNames.map(a=>({
            key: a,
            value: dbCache[a]
        }));
        log.debug("Analytics generated", updates.length, "aggregations", updates);
        await ctx.db.updateBulk({
            database: DBNames.Analytics,
            items: updates
        });

        log.debug("Finished storing all aggregations");
        return next();
    }

    async purgeBlocks(ctx, blocks, next) {
        let dbCache = {};
        let aCtx = {
            ...ctx,
            aggregations: {
                put: (key, val) => {
                    log.debug("Adding aggregation with key", key, val);
                    dbCache[key] = val;
                }
            }
        }
        log.debug("Purging", blocks.length,"blocks from analytics repo across", analytics.length,"analytic handlers");
        for(let i=0;i<analytics.length;++i) {
            let a = analytics[i];
            await a.purgeBlocks(aCtx, blocks, ()=>{});
        }
        log.debug("Resulting analytic repo", dbCache);
        let aggNames = _.keys(dbCache);
        let updates = aggNames.map(a=>({
            key: a,
            value: dbCache[a]
        }));
        await ctx.db.updateBulk({
            database: DBNames.Analytics,
            items: updates
        });

        return next();
    }

    async readFromDB(db) {
        let vals = {};
        await db.iterate({
            database: DBNames.Analytics,
            callback: (v, k) => {
                vals[k] = v;
            }
        });
        return vals;
    }
 }