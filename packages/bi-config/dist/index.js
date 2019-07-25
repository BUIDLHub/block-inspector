"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _yup = require("yup");

var yup = _interopRequireWildcard(_yup);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var schema = yup.object({
    network: yup.object({
        id: yup.number().min(1).required("Missing network.id setting"),
        URL: yup.string().required("Missing network.URL setting")
    }),
    storage: yup.object({
        maxBlocks: yup.number().min(1).required("Missing storage.maxBlocks setting"),
        maxDays: yup.number().min(1).required("Missing storage.maxDays setting"),
        maxSizeMB: yup.number().min(1).required("Missing storage.maxSizeMB setting")
    })
});

var Config = function () {
    _createClass(Config, null, [{
        key: "create",
        value: function create() {
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
            });
        }
    }]);

    function Config(props) {
        _classCallCheck(this, Config);

        schema.validateSync(props);
        var p = schema.cast(props);
        this.network = {
            id: p.network.id,
            URL: p.network.URL
        };
        this.storage = {
            maxBlocks: p.storage.maxBlocks,
            maxDays: p.storage.maxDays,
            maxSizeMB: p.storage.maxSizeMB
        };
    }

    return Config;
}();

exports.default = Config;