import {Creators} from './actions'
import {default as Settings} from 'Constants/settings';

const SETTINGS = {
    network: {
        id: 1
    },
    storage: {
        maxBlocks: 50,
        maxDays: 2,
        maxSizeMB: 5
    }
}

const init = () => async (dispatch, getState) => {
    dispatch(Creators.initSuccess(SETTINGS))
}


export default {
    init
}