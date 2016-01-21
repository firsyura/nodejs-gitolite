'use strict';

var AdminRepo = require('./adminRepo');

module.exports = function (path, cb) {
  new AdminRepo(path, function (err, arp) {
    cb(err || null, arp);
  });
};
