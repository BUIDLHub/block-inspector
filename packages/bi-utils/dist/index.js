'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Time = exports.Logger = undefined;

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _time = require('./time');

var Time = _interopRequireWildcard(_time);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Logger = _Logger2.default;
exports.Time = Time;