'use strict';

var Group = function (name) {
  this.name = name;
};

Group.prototype.toString = function () {
  return '@' + this.name;
};

module.exports = Group;
