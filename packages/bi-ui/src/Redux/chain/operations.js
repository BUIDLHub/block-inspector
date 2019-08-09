
import {Types as settingTypes} from 'Redux/settings/actions'
import {registerDeps} from 'Redux/DepMiddleware'
import {Creators} from './actions'
import Config from 'bi-config';
import BiWeb3 from 'bi-web3';
import {default as Settings} from 'Constants/settings'
import {InBrowser} from 'bi-middleware';

const init = () => async (dispatch, getState) => {
    dispatch(Creators.initStart())
    registerDeps([settingTypes.UPDATE], ()=>{
        
    })
    await dispatch(loadMiddleware())
}

const loadMiddleware = () => async (dispatch,getState) => {
    //set up bi middleware
    let ethProvider = window.ethereum;
    if(!ethProvider && window.web3){
      ethProvider =  window.web.currentProvider;
    }
    if(ethProvider) {

        let acts = await ethProvider.enable();
        if(!acts || acts.length === 0) {
          ethProvider = null;
        } else {
            //If the user changes account in metamask
            ethProvider.on('networkChanged', async (id) => {
                dispatch(initChain(ethProvider))
            });
        }
    }
    return dispatch(initChain(ethProvider));
}

const initChain = (ethProvider) => async (dispatch,getState) => {
    let cfg = getState().settings.params || {}
    
    if(ethProvider) {
        let mw = getState().chain.middleware;
        let newCfg = new Config({
            ...cfg,
            network: {
                ...cfg.network,
                provider: ethProvider
            }
        });
        let old = getState().chain.web3;
        if(old) {
            await old.stop();
        }
        let web3 = new BiWeb3(newCfg);
        if(!mw) {
            console.log("Initializing middleware...")
            mw = new InBrowser();
            await mw.init({web3, config: cfg})
        } else {
            web3 = new BiWeb3(newCfg);
            mw.changeNetwork(web3)
        }

        if(mw && web3) {
            //initialize the middleware which sets up block handlers and web3 connector
            dispatch(Creators.initSuccess({web3, middleware: mw}))
        }
    }
    
}


const startSubscriptions = () => async (dispatch,getState) => {
    let chain = getState().chain;
    let web3 = chain.web3;
    let mw = chain.middleware;
    let cfg = getState().settings.params;

    if(web3 && mw) {
        mw.on("block", async block=>{
            try {
                let an = await mw.analytics();
                if(an) {
                    dispatch(Creators.updateAnalytics(an))
                }
                let s = getState();
                let blocks = [
                    ...s.chain.blocks,
                    block
                ]
                let earliest = block.number - cfg.storage.maxBlocks;
                if(earliest > 0) {
                    blocks = blocks.filter(b=>b.number>earliest);
                }
                let prog =  getState().chain.recoveryProgress;
                if(prog && prog.endBlock > block.number) {
                    prog = {
                        ...prog
                    }
                    prog.progress++;
                    dispatch(Creators.updateRecoveryProgress(prog));
                }
                dispatch(Creators.updateBlocks(blocks))
            } catch (e) {
                console.log("Problem updating with new block", e);
            }
        })
        mw.on("blockRemoved", async block=>{
            try {
                let an = await mw.analytics();
                if(an) {
                    dispatch(Creators.updateAnalytics(an))
                }
                let s = getState()
                let blocks = s.chain.blocks.filter(b=>b.number !== block.number);
                dispatch(Creators.updateBlocks(blocks))
            } catch (e) {
                console.log("Problem removing block", e);
            }
        })

       
        //start new subscription after downstream components refresh on change
        setTimeout(async ()=>{
            
            //recover blocks
            console.log("Getting recovery block range...");
            let blocks = await mw.readCachedBlocks();
            let range = null;
            if(blocks.length > 0) {
                let current = await mw.currentBlock(true); //force read from on-chain
                let analytics = await mw.analytics();
                let earliest = current.number - cfg.storage.maxBlocks;
                blocks = blocks.filter(b=>b.number>earliest);
                if(blocks.length > 0) {
                    range = {
                        fromBlock: blocks[0].number+1,
                        toBlock: current.number
                    }
                } else {
                    let fm = current.number - cfg.storage.maxBlocks;
                    if(fm < 0) {
                        fm = 0;
                    }
                    range = {
                        fromBlock: fm,
                        toBlock: current.number
                    }
                }
                dispatch(Creators.updateBlocks(blocks));
                dispatch(Creators.updateAnalytics(analytics));
                
            } else {
                range = await mw.recoveryBlockRange();
            }

            let diff = range.toBlock-range.fromBlock;
            if(diff > 0) {
                let prog = {
                    total: range.toBlock-range.fromBlock,
                    progress: 0,
                    startBlock: range.fromBlock,
                    endBlock: range.toBlock
                }
                dispatch(Creators.updateRecoveryProgress(prog));
            }

            console.log("Recovering blocks in range", range);
            await mw.recover(range);

            console.log("Staring web3...");
            //then start web3
            await web3.start();

            dispatch(Creators.updateWeb3Status('running'));
        }, 500);
    } else {
        console.log("Missing middleware and/or web3");
    }
}

const toggleSubscriptions = () => async (dispatch, getState) => {
    let chain = getState().chain;
    let status = null;
    if(chain.web3Status !== 'running') {
        await chain.web3.start();
        status = 'running';
    } else {
        status = 'stopped';
        await chain.web3.pause();
    }
    dispatch(Creators.updateWeb3Status(status));
}



export default {
    init,
    startSubscriptions,
    toggleSubscriptions
}
