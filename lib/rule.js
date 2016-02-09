'use strict';

var Rule = function () {
  this.permission = null;
  this.refex = null;
  this.members = [];
};

Rule.prototype.toString = function () {
  return this.permission + (this.refex ? ' ' + this.refex : '') + ' = ' + this.members.join(' ');
};

module.exports = Rule;
