'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _gasTracker = require('./gasTracker');

var _gasTracker2 = _interopRequireDefault(_gasTracker);

var _txnCount = require('./txnCount');

var _txnCount2 = _interopRequireDefault(_txnCount);

var _failures = require('./failures');

var _failures2 = _interopRequireDefault(_failures);

var _blockStats = require('./blockStats');

var _blockStats2 = _interopRequireDefault(_blockStats);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _DBNames = require('../DBNames');

var DBNames = _interopRequireWildcard(_DBNames);

var _biUtils = require('bi-utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Runs blocks through a series of aggregation functions that track counts, etc. Then when all are done, 
 * aggregation data is stored in Analytics DB.
 */

var analytics = [_gasTracker2.default, _txnCount2.default, _failures2.default, _blockStats2.default];

var log = new _biUtils.Logger({ component: "AnalyticsHandler" });

var Analytics = function () {
    function Analytics() {
        var _this = this;

        _classCallCheck(this, Analytics);

        this.aggFields = [];
        ['exec', 'readFromDB'].forEach(function (fn) {
            return _this[fn] = _this[fn].bind(_this);
        });
    }

    _createClass(Analytics, [{
        key: 'exec',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx, block, next) {
                var aggs, aCtx, calls, updates;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                aggs = {};
                                aCtx = _extends({}, ctx, {
                                    aggregations: {
                                        get: function get(key) {
                                            return aggs[key];
                                        },
                                        put: function put(key, val) {
                                            aggs[key] = val;
                                        }
                                    }
                                });

                                log.debug("Running through", analytics.length, "aggregators");
                                calls = [];

                                analytics.forEach(function (a) {
                                    calls.push(a(aCtx, block));
                                });
                                _context.next = 7;
                                return Promise.all(calls);

                            case 7:
                                this.aggNames = _lodash2.default.keys(aggs);
                                updates = this.aggNames.map(function (a) {
                                    return {
                                        key: a,
                                        value: aggs[a]
                                    };
                                });

                                log.debug("Analytics generated", updates.length, "aggregations", updates);
                                _context.next = 12;
                                return ctx.db.updateBulk({
                                    database: DBNames.Analytics,
                                    items: updates
                                });

                            case 12:
                                log.debug("Finished storing all aggregations");
                                return _context.abrupt('return', next());

                            case 14:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function exec(_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return exec;
        }()
    }, {
        key: 'readFromDB',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(db) {
                var calls, results;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                calls = [];

                                log.debug("Reading analytic fields", this.aggNames);
                                this.aggNames.forEach(function (a) {
                                    calls.push(db.read({
                                        database: DBNames.Analytics,
                                        key: a
                                    }));
                                });
                                _context2.next = 5;
                                return Promise.all(calls);

                            case 5:
                                results = _context2.sent;

                                log.debug("Analytics read Results", results);
                                return _context2.abrupt('return', this.aggNames.reduce(function (obj, a, i) {
                                    obj[a] = results[i];
                                    return obj;
                                }, {}));

                            case 8:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function readFromDB(_x4) {
                return _ref2.apply(this, arguments);
            }

            return readFromDB;
        }()
    }]);

    return Analytics;
}();

exports.default = Analytics;