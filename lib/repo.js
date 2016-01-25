'use strict';

var Repo = function () {
  this.name = null;
  this.rules = [];
  this.options = [];
};

Repo.prototype.toString = function () {
  var result = 'repo ' + this.name + '\n';
  result += this.options.map(function (opt) { return '\t' + opt; }).join('\n');
  if(this.options.length > 0) {
    result += '\n';
  }
  result += this.rules.map(function (rule) { return '\t' + rule; }).join('\n');
  if(this.rules.length > 0) {
    result += '\n';
  }

  return result;
};

module.exports = Repo;
