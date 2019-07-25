'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _yup = require('yup');

var yup = _interopRequireWildcard(_yup);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _biUtils = require('bi-utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var schema = yup.object({
    URL: yup.string().required("Missing connector URL setting"),
    id: yup.number().min(1).required("Missing connector id setting"),
    maxRetries: yup.number()
});

var log = new _biUtils.Logger({ component: "bi-Connector" });

var Connector = function (_EventEmitter) {
    _inherits(Connector, _EventEmitter);

    function Connector(props) {
        _classCallCheck(this, Connector);

        var _this = _possibleConstructorReturn(this, (Connector.__proto__ || Object.getPrototypeOf(Connector)).call(this));

        log.debug("Connector config", props);
        schema.validateSync(props);
        _this.URL = props.URL;
        _this.id = props.id;
        _this.maxRetries = props.maxRetries || 50;
        _this.closed = false;
        ['currentBlock', 'open', 'close', 'startBlockSubscription', 'transactions', 'receipt'].forEach(function (fn) {
            return _this[fn] = _this[fn].bind(_this);
        });
        return _this;
    }

    _createClass(Connector, [{
        key: 'currentBlock',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (!this.closed) {
                                    _context.next = 2;
                                    break;
                                }

                                throw new Error("Attemptng to get block after closed");

                            case 2:
                                return _context.abrupt('return', this.lastBlock);

                            case 3:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function currentBlock() {
                return _ref.apply(this, arguments);
            }

            return currentBlock;
        }()
    }, {
        key: 'open',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var n;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                log.info("Opening web3 connection to ", this.URL);
                                if (this.URL.startsWith("ws")) {
                                    this.web3 = new _web2.default(new _web2.default.providers.WebsocketProvider(this.URL));
                                } else {
                                    this.needsPolling = true;
                                    this.web3 = new _web2.default(new _web2.default.providers.HttpProvider(this.URL));
                                }
                                _context2.prev = 2;
                                _context2.next = 5;
                                return this.web3.eth.getBlockNumber();

                            case 5:
                                n = _context2.sent;

                                this.closed = false;
                                _context2.next = 9;
                                return this.web3.eth.getBlock(n - 1, true);

                            case 9:
                                this.lastBlock = _context2.sent;

                                log.info("Current block number for network is", this.lastBlock.number);
                                _context2.next = 16;
                                break;

                            case 13:
                                _context2.prev = 13;
                                _context2.t0 = _context2['catch'](2);

                                log.error("Problem getting block number through connector", _context2.t0);

                            case 16:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[2, 13]]);
            }));

            function open() {
                return _ref2.apply(this, arguments);
            }

            return open;
        }()
    }, {
        key: 'startBlockSubscription',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                var _this2 = this;

                var subCallback;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                if (!this.closed) {
                                    _context4.next = 2;
                                    break;
                                }

                                throw new Error("Attemptng to subscribe after closed");

                            case 2:
                                if (!this.needsPolling) {
                                    _context4.next = 7;
                                    break;
                                }

                                _context4.next = 5;
                                return this.setupPoller();

                            case 5:
                                _context4.next = 11;
                                break;

                            case 7:
                                subCallback = function () {
                                    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(block) {
                                        return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                            while (1) {
                                                switch (_context3.prev = _context3.next) {
                                                    case 0:
                                                        if (block) {
                                                            log.debug("incoming block", block.number);
                                                            _this2.emit("block", block);
                                                        }

                                                    case 1:
                                                    case 'end':
                                                        return _context3.stop();
                                                }
                                            }
                                        }, _callee3, _this2);
                                    }));

                                    return function subCallback(_x) {
                                        return _ref4.apply(this, arguments);
                                    };
                                }();

                                log.info("Starting subscription for new blocks");
                                this.sub = this.web3.eth.subscribe('newBlockHeaders');
                                this.sub.on("data", subCallback);

                            case 11:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function startBlockSubscription() {
                return _ref3.apply(this, arguments);
            }

            return startBlockSubscription;
        }()
    }, {
        key: 'on',
        value: function on(evt, listener) {
            if (this.closed) {
                throw new Error("Attemptng to subscribe after closed");
            }
            _get(Connector.prototype.__proto__ || Object.getPrototypeOf(Connector.prototype), 'on', this).call(this, evt, listener);
        }
    }, {
        key: 'close',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                this.closed = true;

                                if (this.needsPolling) {
                                    _context5.next = 6;
                                    break;
                                }

                                _context5.next = 4;
                                return this.web3.eth.clearSubscriptions();

                            case 4:
                                _context5.next = 9;
                                break;

                            case 6:
                                if (!this.poller) {
                                    _context5.next = 9;
                                    break;
                                }

                                _context5.next = 9;
                                return this.poller.stop();

                            case 9:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function close() {
                return _ref5.apply(this, arguments);
            }

            return close;
        }()
    }, {
        key: 'setupPoller',
        value: function setupPoller() {
            var _this3 = this;

            log.info("Will use polling for new blocks since using HTTP provider");
            this.poller = new Poller(this, this.maxRetries, this.lastBlock, function (block, e) {
                if (e) {
                    log.error("Getting error in poll", e);
                    _this3.emit("error", e);
                } else if (block) {
                    log.info("Getting block from poller", block.number);
                    _this3.lastBlock = block;
                    _this3.emit("block", block);
                }
            });
            return this.poller.start();
        }
    }, {
        key: 'transactions',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(block) {
                var ctx, b;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                if (!(block.transactions && block.transactions.length > 0)) {
                                    _context6.next = 2;
                                    break;
                                }

                                return _context6.abrupt('return', block.transactions);

                            case 2:
                                _context6.prev = 2;
                                ctx = {
                                    tries: 0,
                                    maxRetries: this.maxRetries,
                                    keepGoing: true
                                };
                                _context6.next = 6;
                                return execWithRetries(ctx, this.web3.eth.getBlock, block.number, true);

                            case 6:
                                b = _context6.sent;

                                b.transactions = b.transactions.map(function (t) {
                                    return _normalize(t);
                                });
                                return _context6.abrupt('return', b.transactions);

                            case 11:
                                _context6.prev = 11;
                                _context6.t0 = _context6['catch'](2);

                                log.error("Problem getting transactions for block", _context6.t0);
                                throw _context6.t0;

                            case 15:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this, [[2, 11]]);
            }));

            function transactions(_x2) {
                return _ref6.apply(this, arguments);
            }

            return transactions;
        }()
    }, {
        key: 'receipt',
        value: function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(txn) {
                var ctx, r;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                if (!txn.receipt) {
                                    _context7.next = 2;
                                    break;
                                }

                                return _context7.abrupt('return', txn.receipt);

                            case 2:
                                _context7.prev = 2;
                                ctx = {
                                    tries: 0,
                                    maxRetries: this.maxRetries,
                                    keepGoing: true
                                };
                                _context7.next = 6;
                                return execWithRetries(ctx, this.web3.eth.getTransactionReceipt, txn.hash);

                            case 6:
                                r = _context7.sent;
                                return _context7.abrupt('return', r);

                            case 10:
                                _context7.prev = 10;
                                _context7.t0 = _context7['catch'](2);

                                log.error("Problem getting receipt", _context7.t0);
                                throw _context7.t0;

                            case 14:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this, [[2, 10]]);
            }));

            function receipt(_x3) {
                return _ref7.apply(this, arguments);
            }

            return receipt;
        }()
    }]);

    return Connector;
}(_events2.default);

exports.default = Connector;


var _normalize = function _normalize(t) {
    if (t.to) {
        t.to = t.to.toLowerCase();
    }
    if (t.from) {
        t.from = t.from.toLowerCase();
    }
    return t;
};

var Poller = function () {
    function Poller(conn, maxRetries, currentBlock, callback) {
        var _this4 = this;

        _classCallCheck(this, Poller);

        this.connector = conn;
        this.maxRetries = maxRetries;
        this.callback = callback;
        this.polling = true;
        this.lastBlock = currentBlock;
        ['start', 'stop', '_doPoll'].forEach(function (fn) {
            return _this4[fn] = _this4[fn].bind(_this4);
        });
    }

    _createClass(Poller, [{
        key: 'start',
        value: function start() {
            var _this5 = this;

            return new Promise(function () {
                var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(done, err) {
                    var ctx, handler;
                    return regeneratorRuntime.wrap(function _callee9$(_context9) {
                        while (1) {
                            switch (_context9.prev = _context9.next) {
                                case 0:
                                    log.info("Starting poller to poll for new blocks");
                                    _context9.prev = 1;

                                    log.debug("Sending first block to callback", _this5.lastBlock.number);
                                    _this5.callback(_this5.lastBlock);
                                    _context9.next = 9;
                                    break;

                                case 6:
                                    _context9.prev = 6;
                                    _context9.t0 = _context9['catch'](1);
                                    return _context9.abrupt('return', err(_context9.t0));

                                case 9:
                                    ctx = {
                                        tries: 0,
                                        maxRetries: _this5.maxRetries,
                                        keepGoing: _this5.polling,
                                        sleepTime: 5000
                                    };

                                    handler = function () {
                                        var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
                                            var s, next;
                                            return regeneratorRuntime.wrap(function _callee8$(_context8) {
                                                while (1) {
                                                    switch (_context8.prev = _context8.next) {
                                                        case 0:
                                                            if (_this5.polling) {
                                                                _context8.next = 3;
                                                                break;
                                                            }

                                                            log.info("Polling stopped");
                                                            return _context8.abrupt('return');

                                                        case 3:
                                                            _context8.prev = 3;
                                                            s = Date.now();
                                                            _context8.next = 7;
                                                            return _this5._doPoll(ctx);

                                                        case 7:
                                                            next = 5000 - (Date.now() - s);

                                                            if (next < 0) {
                                                                next = 5000;
                                                            }
                                                            ctx.sleepTime = next;
                                                            log.debug("Sleeping", ctx.sleepTime, "ms before next poll");
                                                            _this5.timeout = setTimeout(handler, ctx.sleepTime);
                                                            _context8.next = 21;
                                                            break;

                                                        case 14:
                                                            _context8.prev = 14;
                                                            _context8.t0 = _context8['catch'](3);

                                                            log.error("Could not pull blocks after max retries", _context8.t0);
                                                            _this5.callback(null, _context8.t0);
                                                            ctx.tries = 0;
                                                            ctx.sleepTime = 5000;
                                                            _this5.timeout = setTimeout(handler, ctx.sleepTime);

                                                        case 21:
                                                        case 'end':
                                                            return _context8.stop();
                                                    }
                                                }
                                            }, _callee8, _this5, [[3, 14]]);
                                        }));

                                        return function handler() {
                                            return _ref9.apply(this, arguments);
                                        };
                                    }();

                                    if (_this5.polling) {
                                        log.info("Scheduling poll after", ctx.sleepTime, 'ms');
                                        _this5.timeout = setTimeout(handler, ctx.sleepTime);
                                    }

                                    done();

                                case 13:
                                case 'end':
                                    return _context9.stop();
                            }
                        }
                    }, _callee9, _this5, [[1, 6]]);
                }));

                return function (_x4, _x5) {
                    return _ref8.apply(this, arguments);
                };
            }());
        }
    }, {
        key: 'stop',
        value: function stop() {
            this.polling = false;
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
        }
    }, {
        key: '_doPoll',
        value: function () {
            var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(ctx) {
                var block;
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                _context10.next = 2;
                                return execWithRetries(ctx, this.connector.web3.eth.getBlock, this.lastBlock.number + 1, true);

                            case 2:
                                block = _context10.sent;

                                if (block && block.number !== this.lastBlock.number) {
                                    this.lastBlock = block;
                                    this.callback(block);
                                } else {
                                    log.debug("Block number is same as last block");
                                }

                            case 4:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function _doPoll(_x6) {
                return _ref10.apply(this, arguments);
            }

            return _doPoll;
        }()
    }]);

    return Poller;
}();

var sleep = function sleep(ms) {
    return new Promise(function (done) {
        setTimeout(done, ms);
    });
};

var execWithRetries = function execWithRetries(ctx, fn) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
    }

    return new Promise(function () {
        var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(done, err) {
            var res;
            return regeneratorRuntime.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            log.debug("Interacting with web3 with retries", ctx);

                        case 1:
                            if (!(ctx.tries < ctx.maxRetries)) {
                                _context11.next = 26;
                                break;
                            }

                            ++ctx.tries;

                            if (ctx.keepGoing) {
                                _context11.next = 6;
                                break;
                            }

                            log.debug("Context said to stop");
                            return _context11.abrupt('return', done());

                        case 6:
                            _context11.prev = 6;

                            log.debug("Calling web3...");
                            _context11.next = 10;
                            return fn.apply(undefined, args);

                        case 10:
                            res = _context11.sent;
                            return _context11.abrupt('return', done(res));

                        case 14:
                            _context11.prev = 14;
                            _context11.t0 = _context11['catch'](6);

                            log.debug("Problem getting next block", _context11.t0);

                            if (!(ctx.tries > ctx.maxRetries)) {
                                _context11.next = 21;
                                break;
                            }

                            return _context11.abrupt('return', err(_context11.t0));

                        case 21:
                            log.debug("Pausing and will try again...");
                            _context11.next = 24;
                            return sleep(1000);

                        case 24:
                            _context11.next = 1;
                            break;

                        case 26:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, undefined, [[6, 14]]);
        }));

        return function (_x7, _x8) {
            return _ref11.apply(this, arguments);
        };
    }());
};