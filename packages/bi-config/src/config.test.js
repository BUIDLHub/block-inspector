import Config from './';

const runTest = (cfg, shouldFail, msg) => {
    let e = null;
    try {
        new Config(cfg);
        if(shouldFail) {
            e = new Error(msg);
        }
    } catch (ex) {
        if(!shouldFail) {
            e = ex;
        }
    }
    if(e) {
        throw e;
    }
}

describe("Config", ()=>{
    it("should not allow invalid settings", done=>{
        let cfg = Config.create();
        try {
            cfg.network.id = 0;
            runTest(cfg, true, "Should not allow missing or invalid networkID");
            cfg.network.id = 1;

            cfg.network.URL = "";
            runTest(cfg, true, "Should not allow invalid networkURL");
            cfg.network.URL = "http://something"

            cfg.storage.maxBlocks = 0;
            runTest(cfg, true, "Should not allow invalid max blocks");
            cfg.storage.maxBlocks = 1;

            cfg.storage.maxDays = 0;
            runTest(cfg, true, "Should not allow invalid max days");
            cfg.storage.maxDays = 1;

            cfg.storage.maxSizeMB = 0;
            runTest(cfg, true, "Should not allow invalid max size");
            cfg.storage.maxSizeMB = 1;
            runTest(cfg, false, "Should pass when all settings are valid");
            done();
        } catch (e) {
            console.log("Test exception caught");
            done(e);
        }
        
    });
})