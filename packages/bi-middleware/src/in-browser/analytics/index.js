import gasTracker,{remove as gasRemove} from './gasTracker';
import txnCount,{remove as txnRemove} from './txnCount';
import failures, {remove as failRemove} from './failures';
import blockStats,{remove as blockStatsRemove} from './blockStats';
import _ from 'lodash';
import * as DBNames from '../DBNames';
import {Logger} from 'bi-utils';

/**
 * Runs blocks through a series of aggregation functions that track counts, etc. Then when all are done, 
 * aggregation data is stored in Analytics DB.
 */

 const analytics = [
     gasTracker,
     txnCount,
     failures,
     blockStats
 ];

 const removals = [
     blockStatsRemove,
     failRemove,
     gasRemove,
     txnRemove
 ]

 const log = new Logger({component: "AnalyticsHandler"});

 export default class Analytics {
     constructor() {
         this.aggFields = [];
         this.cache = {};
         [
             'init',
             'exec',
             'removeFromDB',
             'readFromDB'
         ].forEach(fn=>this[fn]=this[fn].bind(this));
     }

     async init() {
         this.cache = {};
     }

    async exec(ctx, block, next) {
       
        let aCtx = {
            ...ctx,
            aggregations: {
                get: async (key) => {
                    let v = this.cache[key];
                    if(!v) {
                        v = await ctx.db.read({
                                database: DBNames.Analytics,
                                key: key
                            });
                        this.cache[key] = v;
                    }
                    return v;
                },
                put: (key, val) => {
                    log.debug("Adding aggregation with key", key, val);
                    this.cache[key] = val;
                }
            }
        }
        
        log.debug("Running through", analytics.length,"aggregators");
        let calls = [];
        analytics.forEach(a=>{
            calls.push(a(aCtx,block));
        });
        
        await Promise.all(calls);
        this.aggNames = _.keys(this.cache);
        log.debug("Aggregation keys", this.aggNames);
        let updates = this.aggNames.map(a=>({
            key: a,
            value: this.cache[a]
        }));
        log.debug("Analytics generated", updates.length, "aggregations", updates);
        await ctx.db.updateBulk({
            database: DBNames.Analytics,
            items: updates
        });

        log.debug("Finished storing all aggregations");
        return next();
    }

    async removeFromDB(ctx, block) {
        log.debug("Removing block", block.number,"analytics");
        let aCtx = {
            ...ctx,
            aggregations: {
                get: async (key) => {
                    let v = this.cache[key];
                    if(!v) {
                        v = await ctx.db.read({
                                database: DBNames.Analytics,
                                key: key
                            });
                        this.cache[key] = v;
                    }
                    return v;
                },
                put: (key, val) => {
                    log.debug("Adding aggregation with key", key, val);
                    this.cache[key] = val;
                }
            }
        }

        log.debug("Removing from", removals.length,"aggregators");
        let calls = [];
        removals.forEach(r=>{
            calls.push(r(aCtx,block));
        });
        
        await Promise.all(calls);
        this.aggNames = _.keys(this.cache);
        let updates = this.aggNames.map(a=>{
            let v = this.cache[a];
            if(v) {
                return {
                    key: a,
                    value: v
                }
            }
            return null;
        }).filter(a=>a!==null);

        log.debug("Saving", updates.length, "aggregations after removing block", block.number);
        await ctx.db.updateBulk({
            database: DBNames.Analytics,
            items: updates
        });

        log.debug("Finished storing all aggregations");

    }

    async readFromDB(db) {
        let calls = [];
        log.debug("Reading analytic fields", this.aggNames);
        this.aggNames.forEach(a=>{
            calls.push(db.read({
                database: DBNames.Analytics,
                key: a
            }))
        });
        let results = await Promise.all(calls);
        log.debug("Analytics read Results", results);
        return this.aggNames.reduce((obj,a,i)=>{
            obj[a] = results[i];
            return obj;
        },{});
    }
 }