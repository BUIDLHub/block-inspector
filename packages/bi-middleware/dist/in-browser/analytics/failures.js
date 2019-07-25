"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Aggregations failed txn counts
 */
var FAIL_CNT = "_failures";

exports.default = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx, block) {
        var cnt, ex;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        cnt = block.transactions.reduce(function (c, t) {
                            var r = t.receipt;
                            if (r) {
                                var stat = r.status;
                                if (!stat) {
                                    return c + 1;
                                }
                            }
                            return c;
                        }, 0);
                        ex = ctx.aggregations.get(FAIL_CNT) || { total: 0 };

                        ctx.aggregations.put(FAIL_CNT, { total: ex.total + cnt });

                    case 3:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();