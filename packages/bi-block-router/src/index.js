import * as yup from 'yup';
import {Logger} from 'bi-utils';

const schema = yup.object({
    config: yup.object().required("Configuration object required for router"),
    web3: yup.object().required("Missing web3 for router")
});

const log = new Logger({component: "Router"});

export default class Router {
    constructor(props) {
        schema.validateSync(props);
        this.config = props.config;
        this.web3 = props.web3;
        this.handlers = [];
        [
            'use',
            'blockHandler'
        ].forEach(fn=>this[fn]=this[fn].bind(this));
        this.web3.on("block", this.blockHandler);
    }

    use(handler) {
        if(typeof handler !== 'function') {
            throw new Error("Handlers are function with signature (ctx, block, next)")
        }
        this.handlers.push(handler);
    }

    async blockHandler(block) {
        if(!block || this.handlers.length === 0) {
            return;
        }
        let ctx = {
            config: this.config,
            startTime: Date.now(),
            web3: this.web3
        }
        log.debug("Routing block", block.number,"to",this.handlers.length,"handlers");
        let idx = 0;
        let next = async () => {
            ++idx;
            if(idx < this.handlers.length) {
                let h = this.handlers[idx];
                try {
                    await h(ctx, block, next);
                } catch (e) {
                    log.error("Problem with block handler", idx, e);
                }
            } else {
                log.debug("Completed", idx, "route handlers in", (Date.now()-ctx.startTime),'ms');
            }
        }
        try {
            await this.handlers[0](ctx, block, next);
        } catch (e) {
            log.error("Problem with first block handler", e);
        }
    }
}