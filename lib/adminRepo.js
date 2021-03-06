'use strict';

var git = require('gitty'),
  ConfigFile = require('./configFile'),
  fs = require('fs'),
  path = require('path');

var AdminRepo = function (dir, callback) {
  this.path = dir;
  this.config = null;
  this.adminRepo = git(this.path);
  this.configFile = path.join(this.path, 'conf/gitolite.conf');

  callback(null, this);
};

AdminRepo.prototype.update = function (callback) {
  var that = this;
  that.adminRepo.pull('origin', 'master', function(err) {
    ConfigFile.parseFile(that.configFile).then(function(parsedConfig) {
      that.config = parsedConfig;
      callback(err);
    });
  })
};

AdminRepo.prototype.commit = function (message, callback) {
  var that = this;
  ConfigFile.saveFile(that.configFile, that.config).then(function(){
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
  });
};

AdminRepo.prototype.addRepo = function(name) {
  var that = this;
  var repo = new ConfigFile.Repo();
  repo.name = name;
  var newLength = that.config.repos.push(repo);
  return that.config.repos[newLength-1];
};

AdminRepo.prototype.getRepo = function(name) {
  var that = this;
  var index = null;
  that.config.repos.every(function(repo, i) {
    if (repo.name==name) {
      index = i;
      return false;
    } else {
      return true;
    }
  });
  return index===null ? null : that.config.repos[index];
};

AdminRepo.prototype.addPublicKey = function(name, key) {
  return fs.writeFileAsync(path.join(this.path, "keydir/" + name + '.pub'), key);
};

module.exports = AdminRepo;
