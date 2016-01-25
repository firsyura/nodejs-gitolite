'use strict';

var Option = function (key, value) {
  this.key = key;
  this.value = value;
};

Option.prototype.toString = function () {
  return 'option ' + this.key + ' = ' + this.value;
};

module.exports = Option;
