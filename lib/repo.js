'use strict';

var Rule = require('./rule');

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

Repo.prototype.addRule = function (permission, members, refex) {
  var rule = new Rule();
  rule.permission = permission;
  rule.refex = refex;
  rule.members = members;

  this.rules.push(rule);
};

module.exports = Repo;
