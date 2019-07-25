import * as yup from 'yup';

const schema = yup.object({
    network: yup.object({
        id: yup.number().min(1).required("Missing network.id setting"),
        URL: yup.string().required("Missing network.URL setting")
    }),
    storage: yup.object({
        maxBlocks: yup.number().min(1).required("Missing storage.maxBlocks setting"),
        maxDays: yup.number().min(1).required("Missing storage.maxDays setting"),
        maxSizeMB: yup.number().min(1).required("Missing storage.maxSizeMB setting")
    })
})
export default class Config {
    static create() {
        return new Config({
            network: {
                id: 1,
                URL: "https://mainnet.infura.io"
            },
            storage: {
                maxBlocks: 10,
                maxDays: 1,
                maxSizeMB: 5
            }
        })
    }

    constructor(props) {
        schema.validateSync(props);
        let p = schema.cast(props);
        this.network = {
            id: p.network.id,
            URL: p.network.URL
        };
        this.storage = {
           maxBlocks: p.storage.maxBlocks,
           maxDays: p.storage.maxDays,
           maxSizeMB: p.storage.maxSizeMB
        }
    }
}