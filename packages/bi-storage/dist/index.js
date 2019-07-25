'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _LocalForage = require('./LocalForage');

var _LocalForage2 = _interopRequireDefault(_LocalForage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PREFIX = "bi-";

var DB = function DB(props) {
    var _this = this;

    _classCallCheck(this, DB);

    if (!props) {
        props = {};
    }
    this.db = new _LocalForage2.default(_extends({}, props, {
        dbPrefix: props.dbPrefix || PREFIX
    }));

    ['create', 'createBulk', 'read', 'readAll', 'find', 'update', 'updateBulk', 'remove', 'clearAll', 'iterate'].forEach(function (fn) {
        return _this[fn] = _this.db[fn].bind(_this.db);
    });
};

exports.default = DB;