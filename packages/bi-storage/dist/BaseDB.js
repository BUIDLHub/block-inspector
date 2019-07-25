"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortData = exports.iterateSchema = exports.readAllSchema = exports.updateSchema = exports.removeSchema = exports.findSchema = exports.readSchema = exports.sortSchema = exports.createBulkSchema = exports.createSchema = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _yup = require("yup");

var yup = _interopRequireWildcard(_yup);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * An in-memory implementation of storage. Mainly used for
 * testing
*/
var dbBaseSchema = yup.string().required("Missing database parameter");

var createSchema = exports.createSchema = yup.object().shape({
  //database where to store the data
  database: dbBaseSchema,

  //key to use for primary id
  key: yup.string().required("Need a key to store data"),

  //the data to store
  data: yup.object().required("Missing data object to store")
});

var createBulkSchema = exports.createBulkSchema = yup.object().shape({
  database: dbBaseSchema,

  items: yup.array().of(yup.object().shape({
    key: yup.string().required("Need a key to store data"),
    value: yup.object().required("Missing value object to store")
  }))
});

var sortSchema = exports.sortSchema = yup.object().shape({
  field: yup.string().required("Missing sort field name"),
  order: yup.string().required("Missing order")
});

var readSchema = exports.readSchema = yup.object().shape({

  database: dbBaseSchema,

  //or directly with key
  key: yup.string().required("Missing key to read by id"),

  limit: yup.number(),

  sort: yup.array().of(sortSchema)
});

var findSchema = exports.findSchema = yup.object().shape({
  database: dbBaseSchema,

  selector: yup.object().required("Must have a selector for finding by field"),

  limit: yup.number(),

  sort: yup.array().of(sortSchema).nullable()
});

var removeSchema = exports.removeSchema = yup.object().shape({
  database: dbBaseSchema,
  key: yup.string().required("Need key to remove data from database")
});

var updateSchema = exports.updateSchema = yup.object().shape({
  database: dbBaseSchema,
  key: yup.string().required("Missing database key"),
  data: yup.object().required("Missing data to update")
});

var readAllSchema = exports.readAllSchema = yup.object().shape({
  database: dbBaseSchema,
  limit: yup.number(),
  sort: yup.array().of(sortSchema)
});

var iterateSchema = exports.iterateSchema = yup.object().shape({
  database: dbBaseSchema
});

var sortData = exports.sortData = function sortData(ar, def) {
  ar.sort(function (a, b) {
    var fld = def.field;
    var o = def.order.toUpperCase();
    var isAsc = o === 'ASC';
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

var BaseDB = function () {
  function BaseDB(props) {
    var _this = this;

    _classCallCheck(this, BaseDB);

    this.dbs = {};
    this.next = props.next;
    if (!this.next) {
      this.next = {};
    };
    this.dbPrefix = props.dbPrefix || "";

    ['init', '_getDB'].forEach(function (fn) {
      _this[fn] = _this[fn].bind(_this);
    });
  }

  _createClass(BaseDB, [{
    key: "init",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(props) {
        var pfx;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log("Initializing with props", props);
                pfx = props.dbPrefix;

                if (pfx) {
                  pfx += "_";
                }
                this.dbPrefix = pfx || "";

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init(_x) {
        return _ref.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: "_getDB",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(props, factory) {
        var name, db;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (props.database) {
                  _context2.next = 3;
                  break;
                }

                console.log("Incoming props", props);
                throw new Error("No database name provided");

              case 3:
                name = this.dbPrefix + props.database;
                db = this.dbs[name];

                if (db) {
                  _context2.next = 10;
                  break;
                }

                _context2.next = 8;
                return factory({ name: name });

              case 8:
                db = _context2.sent;

                this.dbs[name] = db;

              case 10:
                return _context2.abrupt("return", db);

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _getDB(_x2, _x3) {
        return _ref2.apply(this, arguments);
      }

      return _getDB;
    }()
  }]);

  return BaseDB;
}();

exports.default = BaseDB;