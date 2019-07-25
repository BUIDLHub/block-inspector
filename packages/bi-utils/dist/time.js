'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatDuration = exports.humanizeDuration = exports.normalizeToHour = exports.normalizeToMinute = exports.formatHour = exports.formatTime = exports.formatTimeLong = undefined;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _format = function _format(time, fmt) {
  var test = new Date(time);
  var diff = Math.abs(new Date().getYear() - test.getYear());
  if (diff > 2) {
    time *= 1000;
  }
  var m = _moment2.default.utc(time);
  return m.format(fmt);
};

var formatTimeLong = exports.formatTimeLong = function formatTimeLong(time) {
  if (typeof time === 'undefined') {
    return "no-time";
  }
  return _format(time, "MM-DD-YYYY HH:mm:ss ZZ");
};

var formatTime = exports.formatTime = function formatTime(time, fmt) {
  if (typeof time === 'undefined') {
    return "no-time";
  }

  return _format(time, fmt || "YYYY.MM.DD-HH:mm");
};

var formatHour = exports.formatHour = function formatHour(time) {
  if (!time) {
    return "no-time";
  }
  return _format(time, "HH:mm");
};

var _normalize = function _normalize(time, mod) {
  var test = new Date(time);
  var diff = Math.abs(new Date().getYear() - test.getYear());
  var inSecs = false;
  if (diff > 2) {
    time *= 1000;
    inSecs = true;
  }
  var t = time - time % mod;
  return inSecs ? Math.floor(t / 1000) : t;
};
var normalizeToMinute = exports.normalizeToMinute = function normalizeToMinute(time) {
  return _normalize(time, 60000);
};

var normalizeToHour = exports.normalizeToHour = function normalizeToHour(time) {
  return _normalize(time, 60000 * 60);
};

var humanizeDuration = exports.humanizeDuration = function humanizeDuration(d) {
  var m = _moment2.default.duration(d);
  return m.humanize();
};

var formatDuration = exports.formatDuration = function formatDuration(d) {
  var m = _moment2.default.duration(d);
  var labels = ['d', 'h', 'm', 's'];
  var slots = [m.days(), m.hours(), m.minutes(), m.seconds()];
  var format = "";
  for (var i = slots.length - 1; i >= 0; --i) {
    var l = labels[i];
    var v = slots[i];
    format = '' + v + l + ' ' + format;
  }
  return format.trim();
};