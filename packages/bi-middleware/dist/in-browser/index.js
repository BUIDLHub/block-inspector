'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _biStorage = require('bi-storage');

var _biStorage2 = _interopRequireDefault(_biStorage);

var _biBlockRouter = require('bi-block-router');

var _biBlockRouter2 = _interopRequireDefault(_biBlockRouter);

var _analytics2 = require('./analytics');

var _analytics3 = _interopRequireDefault(_analytics2);

var _enrichment = require('./enrichment');

var _enrichment2 = _interopRequireDefault(_enrichment);

var _yup = require('yup');

var yup = _interopRequireWildcard(_yup);

var _DBNames = require('./DBNames');

var DBNames = _interopRequireWildcard(_DBNames);

var _biUtils = require('bi-utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var schema = yup.object({
    web3: yup.object().required("Missing web3 for InBrowser middleware")
});
var log = new _biUtils.Logger({ component: "InBrowserMiddleware" });
var db = new _biStorage2.default();
var _analytics = new _analytics3.default();

var InBrowser = function () {
    function InBrowser() {
        var _this = this;

        _classCallCheck(this, InBrowser);

        ['init', 'currentBlock', 'analytics', 'blocks'].forEach(function (fn) {
            return _this[fn] = _this[fn].bind(_this);
        });
    }

    _createClass(InBrowser, [{
        key: 'init',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(props) {
                var _this2 = this;

                var attachDB;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                schema.validateSync(props);

                                if (!(typeof props.handler !== 'function')) {
                                    _context3.next = 3;
                                    break;
                                }

                                throw new Error("Missing block handler callback function");

                            case 3:
                                attachDB = function () {
                                    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx, block, next) {
                                        return regeneratorRuntime.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        ctx.db = db;
                                                        return _context.abrupt('return', next());

                                                    case 2:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this2);
                                    }));

                                    return function attachDB(_x2, _x3, _x4) {
                                        return _ref2.apply(this, arguments);
                                    };
                                }();

                                //We clear out all history at startup. This could be changed but makes it more complicated 
                                //to track a window of time at initialization (aggregation counts would have to updated with 
                                //trimmed set of blocks/transactions, etc)


                                _context3.next = 6;
                                return db.clearAll(Object.keys(DBNames));

                            case 6:

                                this.web3 = props.web3;
                                this.router = props.router || new _biBlockRouter2.default({ web3: web3 });
                                this.router.use(attachDB);
                                this.router.use(_enrichment2.default);
                                this.router.use(_analytics.exec);
                                this.router.use(function () {
                                    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(ctx, block, next) {
                                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                            while (1) {
                                                switch (_context2.prev = _context2.next) {
                                                    case 0:
                                                        _context2.prev = 0;
                                                        _context2.next = 3;
                                                        return ctx.db.create({
                                                            database: DBNames.Blocks,
                                                            key: "" + block.number,
                                                            data: block
                                                        });

                                                    case 3:
                                                        props.handler(block);
                                                        _context2.next = 9;
                                                        break;

                                                    case 6:
                                                        _context2.prev = 6;
                                                        _context2.t0 = _context2['catch'](0);

                                                        log.error("Problem calling block handler", _context2.t0);

                                                    case 9:
                                                        next();

                                                    case 10:
                                                    case 'end':
                                                        return _context2.stop();
                                                }
                                            }
                                        }, _callee2, _this2, [[0, 6]]);
                                    }));

                                    return function (_x5, _x6, _x7) {
                                        return _ref3.apply(this, arguments);
                                    };
                                }());

                            case 12:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function init(_x) {
                return _ref.apply(this, arguments);
            }

            return init;
        }()
    }, {
        key: 'currentBlock',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                return _context4.abrupt('return', this.web3.currentBlock());

                            case 1:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function currentBlock() {
                return _ref4.apply(this, arguments);
            }

            return currentBlock;
        }()
    }, {
        key: 'analytics',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                return _context5.abrupt('return', _analytics.readFromDB(db));

                            case 1:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function analytics() {
                return _ref5.apply(this, arguments);
            }

            return analytics;
        }()
    }, {
        key: 'blocks',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(range) {
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function blocks(_x8) {
                return _ref6.apply(this, arguments);
            }

            return blocks;
        }()
    }]);

    return InBrowser;
}();

exports.default = InBrowser;