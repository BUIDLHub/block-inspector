"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _biUtils = require("bi-utils");

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Aggregates global number of transactions received
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */


var GLOBAL_CNT = "_globalTxnCount";
var MIN_CNT = "_txnCountByMinute";

exports.default = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx, block) {
        var ex, min, mins, minCnt;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        ex = ctx.aggregations.get(GLOBAL_CNT) || { total: 0 };
                        min = _biUtils.Time.normalizeToMinute(block.timestamp);
                        mins = ctx.aggregations.get(MIN_CNT) || {};
                        minCnt = mins[min] || 0;

                        minCnt += block.transactions.length;
                        mins[min] = minCnt;
                        ctx.aggregations.put(GLOBAL_CNT, { total: ex.total + block.transactions.length });
                        ctx.aggregations.put(MIN_CNT, mins);

                    case 8:
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