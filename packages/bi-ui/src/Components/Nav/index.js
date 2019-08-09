import {connect} from 'react-redux';
import Nav from './Nav';
import {withRouter} from 'react-router-dom';

const s2p = state => {
    return  {
        web3Running: state.chain.web3Status === 'running'
    }
}

const d2p = dispatch => {
    return {
        goHome: () => {

        },
        pauseNetwork: () => {

        },
        toSettings: () => {

        },

    }
}

export default withRouter(connect(s2p, d2p)(Nav))