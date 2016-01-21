'use strict';

var git = require('gitty');

var AdminRepo = function (path, callback) {
  this.adminRepo = git(path);

  callback(null, this);
};

AdminRepo.prototype.update = function (callback) {
  this.adminRepo.pull('origin', 'master', function(err) {
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
