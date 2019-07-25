'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _yup = require('yup');

var yup = _interopRequireWildcard(_yup);

var _biUtils = require('bi-utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var schema = yup.object({
    web3: yup.object().required("Missing web3 for router")
});

var log = new _biUtils.Logger({ component: "Router" });

var Router = function () {
    function Router(props) {
        var _this = this;

        _classCallCheck(this, Router);

        schema.validateSync(props);
        this.web3 = props.web3;
        this.handlers = [];
        ['use', 'blockHandler'].forEach(function (fn) {
            return _this[fn] = _this[fn].bind(_this);
        });
        this.web3.on("block", this.blockHandler);
    }

    _createClass(Router, [{
        key: 'use',
        value: function use(handler) {
            if (typeof handler !== 'function') {
                throw new Error("Handlers are function with signature (ctx, block, next)");
            }
            this.handlers.push(handler);
        }
    }, {
        key: 'blockHandler',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(block) {
                var _this2 = this;

                var ctx, idx, next;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (!(!block || this.handlers.length === 0)) {
                                    _context2.next = 2;
                                    break;
                                }

                                return _context2.abrupt('return');

                            case 2:
                                ctx = {
                                    startTime: Date.now(),
                                    web3: this.web3
                                };

                                log.debug("Routing block", block.number, "to", this.handlers.length, "handlers");
                                idx = 0;

                                next = function () {
                                    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                                        var h;
                                        return regeneratorRuntime.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        ++idx;

                                                        if (!(idx < _this2.handlers.length)) {
                                                            _context.next = 13;
                                                            break;
                                                        }

                                                        h = _this2.handlers[idx];
                                                        _context.prev = 3;
                                                        _context.next = 6;
                                                        return h(ctx, block, next);

                                                    case 6:
                                                        _context.next = 11;
                                                        break;

                                                    case 8:
                                                        _context.prev = 8;
                                                        _context.t0 = _context['catch'](3);

                                                        log.error("Problem with block handler", idx, _context.t0);

                                                    case 11:
                                                        _context.next = 14;
                                                        break;

                                                    case 13:
                                                        log.debug("Completed", idx, "route handlers in", Date.now() - ctx.startTime, 'ms');

                                                    case 14:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, _this2, [[3, 8]]);
                                    }));

                                    return function next() {
                                        return _ref2.apply(this, arguments);
                                    };
                                }();

                                _context2.prev = 6;
                                _context2.next = 9;
                                return this.handlers[0](ctx, block, next);

                            case 9:
                                _context2.next = 14;
                                break;

                            case 11:
                                _context2.prev = 11;
                                _context2.t0 = _context2['catch'](6);

                                log.error("Problem with first block handler", _context2.t0);

                            case 14:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[6, 11]]);
            }));

            function blockHandler(_x) {
                return _ref.apply(this, arguments);
            }

            return blockHandler;
        }()
    }]);

    return Router;
}();

exports.default = Router;