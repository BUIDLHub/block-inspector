'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _biUtils = require('bi-utils');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Router handler that retrieves receipts for each transactions and appends them to the txn objects
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */


var log = new _biUtils.Logger({ component: 'AppendReceipts' });

exports.default = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx, block, next) {
        var txns, all, s, rs;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        txns = block.transactions;

                        if (!(!txns || txns.length === 0)) {
                            _context.next = 3;
                            break;
                        }

                        return _context.abrupt('return', next());

                    case 3:
                        all = [];

                        log.debug("Appending receipts to", txns.length, "transactions");
                        s = Date.now();

                        txns.forEach(function (t) {
                            all.push(ctx.web3.receipt(t));
                        });
                        _context.next = 9;
                        return Promise.all(all);

                    case 9:
                        rs = _context.sent;

                        log.debug("Retrieved", rs.length, "receipts in", Date.now() - s, "ms");
                        rs.forEach(function (r, i) {
                            txns[i].receipt = r;
                        });
                        return _context.abrupt('return', next());

                    case 13:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();