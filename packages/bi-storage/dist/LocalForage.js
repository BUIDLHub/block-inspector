'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _localforage = require('localforage');

var _localforage2 = _interopRequireDefault(_localforage);

var _localforageSetitems = require('localforage-setitems');

var _BaseDB2 = require('./BaseDB');

var _BaseDB3 = _interopRequireDefault(_BaseDB2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _biUtils = require('bi-utils');

var _LocalFSStorage = require('./LocalFSStorage');

var _LocalFSStorage2 = _interopRequireDefault(_LocalFSStorage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(0, _localforageSetitems.extendPrototype)(_localforage2.default);
var log = new _biUtils.Logger({ component: "LocalForage" });
var dbNames = {};
var inst = null;

var _LocalForage = function (_BaseDB) {
  _inherits(_LocalForage, _BaseDB);

  _createClass(_LocalForage, null, [{
    key: 'instance',
    get: function get() {
      if (!inst) {
        throw new Error("Did not initialize shared storage instance");
      }
      return inst;
    }
  }]);

  function _LocalForage(props) {
    _classCallCheck(this, _LocalForage);

    var _this = _possibleConstructorReturn(this, (_LocalForage.__proto__ || Object.getPrototypeOf(_LocalForage)).call(this, props));

    ['create', 'createBulk', 'read', 'readAll', 'find', 'update', 'updateBulk', 'remove', 'clearAll', 'iterate'].forEach(function (fn) {
      _this[fn] = _this[fn].bind(_this);
    });
    if (!localStorageValid()) {
      log.debug("Installing local FS driver...");
    }
    inst = _this;
    return _this;
  }

  _createClass(_LocalForage, [{
    key: 'clearAll',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(dbs) {
        var i, k, pfx, nm, db;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!dbs) {
                  dbs = _lodash2.default.keys(dbNames);
                }
                i = 0;

              case 2:
                if (!(i < dbs.length)) {
                  _context.next = 20;
                  break;
                }

                k = dbs[i];

                if (k) {
                  _context.next = 6;
                  break;
                }

                return _context.abrupt('continue', 17);

              case 6:
                pfx = this.dbPrefix || "";
                nm = pfx + k;
                _context.next = 10;
                return this._getDB({ database: k }, dbFactory);

              case 10:
                db = _context.sent;

                if (db) {
                  _context.next = 13;
                  break;
                }

                return _context.abrupt('return');

              case 13:
                log.info("Dropping DB", nm);
                _context.next = 16;
                return db.dropInstance();

              case 16:
                this.dbs[nm] = undefined;

              case 17:
                ++i;
                _context.next = 2;
                break;

              case 20:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function clearAll(_x) {
        return _ref.apply(this, arguments);
      }

      return clearAll;
    }()
  }, {
    key: 'create',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(props) {
        var _this2 = this;

        var db;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _BaseDB2.createSchema.validateSync(props);
                _context3.next = 3;
                return this._getDB(props, dbFactory);

              case 3:
                db = _context3.sent;
                _context3.prev = 4;
                _context3.next = 7;
                return db.ready().then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return db.setItem(props.key, props.data);

                        case 2:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, _this2);
                })));

              case 7:
                _context3.next = 12;
                break;

              case 9:
                _context3.prev = 9;
                _context3.t0 = _context3['catch'](4);

                log.error("Problem storing to", props.database, _context3.t0);

              case 12:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this, [[4, 9]]);
      }));

      function create(_x2) {
        return _ref2.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'createBulk',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(props) {
        var db;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _BaseDB2.createBulkSchema.validateSync(props);
                _context4.next = 3;
                return this._getDB(props, dbFactory);

              case 3:
                db = _context4.sent;
                _context4.prev = 4;
                _context4.next = 7;
                return db.setItems(props.items);

              case 7:
                _context4.next = 12;
                break;

              case 9:
                _context4.prev = 9;
                _context4.t0 = _context4['catch'](4);

                log.error("Problem storing items", props.database, _context4.t0);

              case 12:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this, [[4, 9]]);
      }));

      function createBulk(_x3) {
        return _ref4.apply(this, arguments);
      }

      return createBulk;
    }()
  }, {
    key: 'read',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(props) {
        var db, r;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _BaseDB2.readSchema.validateSync(props);
                _context5.next = 3;
                return this._getDB(props, dbFactory);

              case 3:
                db = _context5.sent;
                _context5.next = 6;
                return db.getItem(props.key);

              case 6:
                r = _context5.sent;
                return _context5.abrupt('return', r);

              case 8:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function read(_x4) {
        return _ref5.apply(this, arguments);
      }

      return read;
    }()
  }, {
    key: 'readAll',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(props) {
        var db, set, sortFn, limit, filterFn;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _BaseDB2.readAllSchema.validateSync(props);
                _context6.next = 3;
                return this._getDB(props, dbFactory);

              case 3:
                db = _context6.sent;
                set = [];
                sortFn = _buildSortFn(props);
                limit = props.limit || this.querySizeLimit;
                filterFn = props.filterFn;
                _context6.next = 10;
                return db.iterate(function (v, k, itNum) {
                  if (itNum > limit) {
                    return set;
                  }
                  if (filterFn) {
                    if (filterFn(v, k, itNum)) {
                      set.push(v);
                    }
                  } else {
                    set.push(v);
                  }
                });

              case 10:
                if (sortFn) {
                  sortFn(set);
                }
                return _context6.abrupt('return', set);

              case 12:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function readAll(_x5) {
        return _ref6.apply(this, arguments);
      }

      return readAll;
    }()
  }, {
    key: 'iterate',
    value: function () {
      var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(props) {
        var db;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _BaseDB2.iterateSchema.validateSync(props);

                if (!(typeof props.callback !== 'function')) {
                  _context7.next = 3;
                  break;
                }

                throw new Error("Missing callback function");

              case 3:
                _context7.next = 5;
                return this._getDB(props, dbFactory);

              case 5:
                db = _context7.sent;
                _context7.next = 8;
                return db.iterate(props.callback);

              case 8:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function iterate(_x6) {
        return _ref7.apply(this, arguments);
      }

      return iterate;
    }()
  }, {
    key: 'find',
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(props) {
        var db, set, sortFn, limit, selKeys, offset, includeTotal, skipping, endLength, total;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _BaseDB2.findSchema.validateSync(props);
                _context8.next = 3;
                return this._getDB(props, dbFactory);

              case 3:
                db = _context8.sent;
                set = [];
                sortFn = _buildSortFn(props);
                limit = props.limit || this.querySizeLimit;
                selKeys = _lodash2.default.keys(props.selector);
                offset = props.offset || 0;
                includeTotal = props.includeTotal;
                skipping = offset > 0;
                endLength = offset + limit;
                total = 0;
                _context8.next = 15;
                return db.iterate(function (dbVal, dbKey, itNum) {
                  var allMatch = true;
                  //filter based on selectors first. This way we make
                  //sure paging and sorting work with the same dataset
                  //each time. This is terribly slow but localforage/indexedDB
                  //doesn't offer skipping records. An optimization might be
                  //to keep our own index of record counts so that at a minimum
                  //we're not running through entire set each time. Skipping would
                  //still require walk from beginning. I don't know what happens if
                  //records are inserted during paging operation...would we miss an
                  //item if it's key were iterated earlier than the page we skipped?
                  //This needs more thought.
                  for (var i = 0; i < selKeys.length; ++i) {
                    var p = selKeys[i];
                    var tgt = props.selector[p];
                    var v = dbVal[p];
                    if (!isNaN(v) && !isNaN(tgt)) {
                      v -= 0;
                      tgt -= 0;
                    }
                    if (v !== tgt) {
                      allMatch = false;
                      break;
                    }
                  }
                  if (allMatch) {
                    ++total;
                    if (!skipping && set.length < endLength) {
                      set.push(dbVal);
                    } else if (!skipping && set.length >= endLength && !includeTotal) {
                      return set;
                    }
                  }

                  skipping = total < offset || set.length > offset + limit;
                });

              case 15:

                if (sortFn) {
                  sortFn(set);
                }

                if (!includeTotal) {
                  _context8.next = 18;
                  break;
                }

                return _context8.abrupt('return', {
                  total: total,
                  data: set
                });

              case 18:
                return _context8.abrupt('return', set);

              case 19:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function find(_x7) {
        return _ref8.apply(this, arguments);
      }

      return find;
    }()
  }, {
    key: 'update',
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(props) {
        var _this3 = this;

        var db;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _BaseDB2.updateSchema.validateSync(props);
                _context10.next = 3;
                return this._getDB(props, dbFactory);

              case 3:
                db = _context10.sent;
                _context10.prev = 4;
                _context10.next = 7;
                return db.ready().then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
                  return regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) {
                      switch (_context9.prev = _context9.next) {
                        case 0:
                          _context9.next = 2;
                          return db.setItem(props.key, props.data);

                        case 2:
                        case 'end':
                          return _context9.stop();
                      }
                    }
                  }, _callee9, _this3);
                })));

              case 7:
                _context10.next = 12;
                break;

              case 9:
                _context10.prev = 9;
                _context10.t0 = _context10['catch'](4);

                log.error("Problem storing to", props.database, _context10.t0);

              case 12:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, this, [[4, 9]]);
      }));

      function update(_x8) {
        return _ref9.apply(this, arguments);
      }

      return update;
    }()
  }, {
    key: 'updateBulk',
    value: function () {
      var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(props) {
        var _this4 = this;

        var db;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _BaseDB2.createBulkSchema.validateSync(props);
                _context12.next = 3;
                return this._getDB(props, dbFactory);

              case 3:
                db = _context12.sent;

                log.debug("Storing", props.items.length, "items to", props.database);
                _context12.prev = 5;
                _context12.next = 8;
                return db.ready().then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
                  return regeneratorRuntime.wrap(function _callee11$(_context11) {
                    while (1) {
                      switch (_context11.prev = _context11.next) {
                        case 0:
                          _context11.next = 2;
                          return db.setItems(props.items, null, null, function (e, res) {
                            if (e) {
                              log.error("Problem storing bulk items", e);
                            }
                          });

                        case 2:
                        case 'end':
                          return _context11.stop();
                      }
                    }
                  }, _callee11, _this4);
                })));

              case 8:
                _context12.next = 13;
                break;

              case 10:
                _context12.prev = 10;
                _context12.t0 = _context12['catch'](5);

                log.error("Problem storing items", props.database, _context12.t0);

              case 13:
              case 'end':
                return _context12.stop();
            }
          }
        }, _callee12, this, [[5, 10]]);
      }));

      function updateBulk(_x9) {
        return _ref11.apply(this, arguments);
      }

      return updateBulk;
    }()
  }, {
    key: 'remove',
    value: function () {
      var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(props) {
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                _BaseDB2.removeSchema.validateSync(props);

              case 1:
              case 'end':
                return _context13.stop();
            }
          }
        }, _callee13, this);
      }));

      function remove(_x10) {
        return _ref13.apply(this, arguments);
      }

      return remove;
    }()
  }]);

  return _LocalForage;
}(_BaseDB3.default);

exports.default = _LocalForage;


var _buildSortFn = function _buildSortFn(props) {
  if (!props.sort) {
    props.sort = [{
      field: "timestamp",
      order: "desc"
    }];
  }

  var sorter = function sorter(set, fld, isAsc) {
    set.sort(function (a, b) {
      var av = a[fld];
      var bv = b[fld];
      if (av > bv) {
        return isAsc ? 1 : -1;
      }
      if (av < bv) {
        return isAsc ? -1 : 1;
      }
      return 0;
    });
  };
  return function (set) {
    props.sort.forEach(function (s) {
      sorter(set, s.field, s.order.toUpperCase() === 'ASC');
    });
  };
};

var canStoreInLS = function canStoreInLS() {
  try {
    if (typeof localStorage === 'undefined') {
      log.debug("Cannot store in localstorage");
      return false;
    }

    localStorage.setItem("__test", "true");

    var i = localStorage.getItem("__test");
    log.debug("LS test", i);
    if (!i) {
      return false;
    }
    localStorage.removeItem("__test");
    return true;
  } catch (e) {
    log.error("Problem storing LS", e);
    return false;
  }
};

var localStorageValid = function localStorageValid() {
  log.debug("Testing local storage");
  return typeof localStorage !== 'undefined' && 'setItem' in localStorage && canStoreInLS();
};

var dbFactory = function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(props) {
    var lfProps, local, db;
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            lfProps = {
              name: props.name
            };

            dbNames[props.name] = true;
            if (!canStoreInLS()) {
              lfProps.driver = "localFSDriver";
              local = new _LocalFSStorage2.default();

              _localforage2.default.defineDriver(local).then(function () {
                _localforage2.default.setDriver(local._driver);
              });
            }
            log.info("Creating DB", props.name);
            _context14.next = 6;
            return _localforage2.default.createInstance(lfProps);

          case 6:
            db = _context14.sent;
            return _context14.abrupt('return', db);

          case 8:
          case 'end':
            return _context14.stop();
        }
      }
    }, _callee14, undefined);
  }));

  return function dbFactory(_x11) {
    return _ref14.apply(this, arguments);
  };
}();