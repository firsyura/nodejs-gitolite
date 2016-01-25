'use strict';

var git = require('gitty');
var ConfigFile = require('./configFile'),
  path = require('path');

var AdminRepo = function (path, callback) {
  this.path = path;
  this.config = null;
  this.adminRepo = git(path);

  callback(null, this);
};

AdminRepo.prototype.update = function (callback) {
  var that = this;
  that.adminRepo.pull('origin', 'master', function(err) {
    var configFile = path.join(that.path, 'conf/gitolite.conf');
    ConfigFile.parseFile(configFile, that).then(function(parsedConfig) {
      that.config = parsedConfig;
    });
    callback(err);
  })
};

AdminRepo.prototype.commit = function (message, callback) {
  var that = this;
  that.adminRepo.add(['.'], function(err) {
    if (!err) {
      that.adminRepo.commit(message, function(err) {
        if (!err) {
          that.adminRepo.push('origin', 'master', function(err) {
            if (!err) {
              callback(null);
            } else {
              callback(err);
            }
          })
        } else {
          callback(err);
        }
      })
    } else {
      callback(err);
    }
  });
};

module.exports = AdminRepo;
