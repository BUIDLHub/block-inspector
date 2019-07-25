"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Increments total gas usage based on all txns in a block
 */

var GLOBAL_GU_KEY = "_globalGasUsed";

exports.default = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx, block) {
        var totalGU, ex;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:

                        /*
                         let txns = block.transactions;
                         if(!txns || txns.length === 0) {
                             return;
                         }
                         let totalGU = 0;
                         txns.forEach(txn=>{
                            let r = txn.receipt;
                            if(!r) {
                                return;
                            }
                            let gu = r.gasUsed;
                            if(!gu) {
                                return;
                            }
                            if(gu.toString) {
                                gu = gu.toString() - 0;
                            } else {
                                gu -= 0;
                            }
                            totalGU += gu;
                         });
                         */
                        totalGU = block.gasUsed;

                        if (totalGU.toString) {
                            totalGU = totalGU.toString() - 0;
                        } else {
                            totalGU -= 0;
                        }
                        ex = ctx.aggregations.get(GLOBAL_GU_KEY) || { total: 0 };

                        ctx.aggregations.put(GLOBAL_GU_KEY, { total: ex.total + totalGU });

                    case 4:
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