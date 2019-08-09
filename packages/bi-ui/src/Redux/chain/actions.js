import {createActions} from 'reduxsauce'

const {Types, Creators} = createActions({
    initStart: null,
    initSuccess: ['props'],
    failure: ['error'],
    updateRecoveryProgress: ['progress'],
    updateWeb3Status: ['status'],
    updateAnalytics: ['analytics'],
    updateBlocks: ['blocks']
}, {prefix: "chain."});
export {
    Types, Creators
}