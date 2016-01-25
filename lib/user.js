'use strict';

var User = function (name) {
  this.name = name;
};

User.prototype.toString = function () {
  return this.name;
};

module.exports = User;
