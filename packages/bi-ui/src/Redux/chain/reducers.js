import {Types} from './actions'
import {createReducer} from 'reduxsauce'
import { bindActionCreators } from 'redux';

const INIT = {
    loading: false,
    error: null,
    web3: null,
    web3Status: 'idle',
    recoveryProgress: {
        total: 0,
        progress: 0,
        startBlock: 0,
        endBlock: 0
    },
    middleware: null,
    subscriptions: null,
    blocks: [],
    transactions: [],
    analytics: {}
}

const start = (state=INIT) => {
    return {
        ...state, 
        loading: true, 
        error: null
    }
}

const done = (state=INIT, action) => {
    return {
        ...state,
        loading: false, 
        web3: action.props.web3,
        middleware: action.props.middleware
    }
}


const fail = (state=INIT, action) => {
    return {
        ...state, 
        loading: false,
        error: action.error
    }
}

const updateBlocks = (state=INIT, action) => {
    let blocks = [
        ...action.blocks
    ];
    blocks.sort((a,b)=>b.timestamp-a.timestamp);
    let txns = blocks.reduce((a, b)=>{
        return [
            ...a,
            ...b.transactions
        ]
    }, []);
    return {
        ...state,
        blocks,
        transactions: txns
    }
}

const updateAnalytics = (state=INIT, action) => {
    return {
        ...state,
        analytics: {
            ...action.analytics
        }
    }
}

const updateWeb3 = (state=INIT, action) => {
    return {
        ...state,
        web3Status: action.status
    }
}

const updateProgress = (state=INIT, action) => {
    
    return {
        ...state,
        recoveryProgress: action.progress
    }
}

const HANDLERS = {
    [Types.INIT_START]: start,
    [Types.INIT_SUCCESS]: done, 
    [Types.FAILURE]: fail,
    [Types.UPDATE_BLOCKS]: updateBlocks,
    [Types.UPDATE_ANALYTICS]: updateAnalytics,
    [Types.UPDATE_WEB3_STATUS]: updateWeb3,
    [Types.UPDATE_RECOVERY_PROGRESS]: updateProgress
}

export default createReducer(INIT, HANDLERS);