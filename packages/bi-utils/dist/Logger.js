"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Logger = function () {
  function Logger(props) {
    var _this = this;

    _classCallCheck(this, Logger);

    if (!props.component.startsWith("bi-")) {
      props.component = "bi-" + props.component;
    }

    this._info = require('debug')(props.component + ":info");
    this._warn = require('debug')(props.component + ":warn");
    this._error = require('debug')(props.component + ":error");
    this._debug = require('debug')(props.component + ":debug");

    this._info.enabled = true;
    this._warn.enabled = true;
    this._error.enabled = true;

    ['info', 'warn', 'error', 'debug', '_log'].forEach(function (fn) {
      return _this[fn] = _this[fn].bind(_this);
    });
  }

  _createClass(Logger, [{
    key: "_log",
    value: function _log(level, args) {
      var msg = "";
      args.forEach(function (a, i) {
        msg += i > 0 ? " " : "";
        if (typeof a === 'string') {
          msg += "%s";
        } else if (a instanceof Error) {
          msg += "%s";
          args[i] = a.toString();
        } else if (Array.isArray(a)) {
          args[i] = JSON.stringify(a);
          msg += "%s";
        } else if ((typeof a === "undefined" ? "undefined" : _typeof(a)) === 'object') {
          msg += "%O";
        } else if (!isNaN(a)) {
          msg += "%d";
        }
      });
      level.apply(undefined, [msg].concat(_toConsumableArray(args)));
    }
  }, {
    key: "info",
    value: function info() {
      if (!this._info.enabled) {
        return;
      }
      this._log(this._info, [].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: "warn",
    value: function warn() {
      if (!this._warn.enabled) {
        return;
      }
      this._log(this._warn, [].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: "error",
    value: function error() {
      if (!this._error.enabled) {
        return;
      }
      this._log(this._error, [].concat(Array.prototype.slice.call(arguments)));
    }
  }, {
    key: "debug",
    value: function debug() {
      if (!this._debug.enabled) {
        return;
      }
      this._log(this._debug, [].concat(Array.prototype.slice.call(arguments)));
    }
  }]);

  return Logger;
}();

exports.default = Logger;