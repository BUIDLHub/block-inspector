"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Aggregates info specific to blocks
 */
var BLOCK_KEY = "_blockStats";

exports.default = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx, block) {
        var callCnt, valCnt, ex;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        callCnt = block.transactions.reduce(function (c, t) {
                            if (t.input.length > 2) {
                                return c + 1;
                            }
                            return c;
                        }, 0);
                        valCnt = block.transactions.length - callCnt;
                        ex = ctx.aggregations.get(BLOCK_KEY) || {};

                        ex[block.number] = {
                            contractCalls: callCnt,
                            valueXfers: valCnt
                        };
                        ctx.aggregations.put(BLOCK_KEY, ex);

                    case 5:
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