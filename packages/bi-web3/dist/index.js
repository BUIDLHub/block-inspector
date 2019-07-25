'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _biConfig = require('bi-config');

var _biConfig2 = _interopRequireDefault(_biConfig);

var _Connector = require('./Connector');

var _Connector2 = _interopRequireDefault(_Connector);

var _biUtils = require('bi-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = new _biUtils.Logger({ component: "Web3" });

var BiWeb3 = function () {
    function BiWeb3(config) {
        var _this = this;

        _classCallCheck(this, BiWeb3);

        if (!config) {
            config = _biConfig2.default.create();
        }
        this.connector = new _Connector2.default(config.network);
        this.config = config;
        this._web3 = this.connector.web3;
        this.on = this.connector.on.bind(this.connector);
        ['start', 'stop', 'currentBlock'].forEach(function (fn) {
            return _this[fn] = _this[fn].bind(_this);
        });
    }

    _createClass(BiWeb3, [{
        key: 'start',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                okOrThrow(this.connector, "Attempting to start a closed web3 instance");
                                _context.next = 3;
                                return this.connector.open();

                            case 3:
                                return _context.abrupt('return', this.connector.startBlockSubscription());

                            case 4:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function start() {
                return _ref.apply(this, arguments);
            }

            return start;
        }()
    }, {
        key: 'stop',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this.connector.close();

                            case 2:
                                this.connector = null;

                            case 3:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function stop() {
                return _ref2.apply(this, arguments);
            }

            return stop;
        }()
    }, {
        key: 'currentBlock',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                okOrThrow(this.connector, "Attempting to get block from closed web3");
                                return _context3.abrupt('return', this.connector.currentBlock());

                            case 2:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function currentBlock() {
                return _ref3.apply(this, arguments);
            }

            return currentBlock;
        }()
    }, {
        key: 'transactions',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(block) {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                okOrThrow(this.connector, "Attempting to get transactions from closed web3");
                                log.debug("Getting transactions for block", block.number);
                                return _context4.abrupt('return', this.connector.transactions(block));

                            case 3:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function transactions(_x) {
                return _ref4.apply(this, arguments);
            }

            return transactions;
        }()
    }, {
        key: 'receipt',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(txn) {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                okOrThrow(this.connector, "Attempting to get receipt from closed web3");
                                log.debug("Getting receipts for txn", txn.hash);
                                return _context5.abrupt('return', this.connector.receipt(txn));

                            case 3:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function receipt(_x2) {
                return _ref5.apply(this, arguments);
            }

            return receipt;
        }()
    }]);

    return BiWeb3;
}();

exports.default = BiWeb3;


var okOrThrow = function okOrThrow(obj, msg) {
    if (!obj) {
        throw new Error(msg);
    }
};