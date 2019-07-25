import Config from 'bi-config';
import Connector from './Connector'
import {Logger} from 'bi-utils';

const log = new Logger({component: "Web3"});

export default class BiWeb3 {
    constructor(config) {
        if(!config) {
            config = Config.create();
        }
        this.connector = new Connector(config.network);
        this.config = config;
        this._web3 = this.connector.web3;
        this.on = this.connector.on.bind(this.connector);
        [
            'start',
            'stop',
            'currentBlock'
        ].forEach(fn=>this[fn]=this[fn].bind(this))
    }

    async start() {
        okOrThrow(this.connector,"Attempting to start a closed web3 instance");
        await this.connector.open();
        return this.connector.startBlockSubscription();
    }

    async stop() {
       await this.connector.close();
       this.connector = null;
    }

    async currentBlock() {
        okOrThrow(this.connector, "Attempting to get block from closed web3");
        return this.connector.currentBlock();
    }

    async transactions(block) {
        okOrThrow(this.connector, "Attempting to get transactions from closed web3");
        log.debug("Getting transactions for block", block.number);
        return this.connector.transactions(block);
    }

    async receipt(txn) {
        okOrThrow(this.connector, "Attempting to get receipt from closed web3");
        log.debug("Getting receipts for txn", txn.hash);
        return this.connector.receipt(txn);
    }
}

const okOrThrow = (obj, msg) => {
    if(!obj) {
        throw new Error(msg);
    }
}