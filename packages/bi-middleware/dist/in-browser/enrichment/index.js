'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _appendTransactions = require('./appendTransactions');

var _appendTransactions2 = _interopRequireDefault(_appendTransactions);

var _appendReceipts = require('./appendReceipts');

var _appendReceipts2 = _interopRequireDefault(_appendReceipts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var handlers = [_appendTransactions2.default, _appendReceipts2.default];

exports.default = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(ctx, block, next) {
        var _this = this;

        var idx, _next;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        idx = 0;

                        _next = function () {
                            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                                var h;
                                return regeneratorRuntime.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                ++idx;

                                                if (!(idx >= handlers.length)) {
                                                    _context.next = 3;
                                                    break;
                                                }

                                                return _context.abrupt('return', next());

                                            case 3:
                                                h = handlers[idx];
                                                _context.next = 6;
                                                return h(ctx, block, _next);

                                            case 6:
                                            case 'end':
                                                return _context.stop();
                                        }
                                    }
                                }, _callee, _this);
                            }));

                            return function _next() {
                                return _ref2.apply(this, arguments);
                            };
                        }();

                        _context2.next = 4;
                        return handlers[0](ctx, block, _next);

                    case 4:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();