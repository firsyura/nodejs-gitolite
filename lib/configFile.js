'use strict';


var Repo = require('./repo'),
  Rule = require('./rule'),
  User = require('./user'),
  Group = require('./group'),
  Include = require('./include'),
  Option = require('./option'),
  GroupDefinition = require('./group-definition');

var Promise = require('bluebird'),
  fs = Promise.promisifyAll(require('fs'))
  ;

function empty(v) { return !!v; }

function parseRepo(line) {
  // everything after it is either a repo group (begins with @) or a single repo name (everything else)
  var repo = new Repo();
  line.split(' ').filter(empty).map(function (symbol) {
    repo.name = symbol;
  });

  return repo;
}

function parseInclude(line) {
  var include = new Include();
  // everything after it is a quoted glob match relative to conf/
  include.file = line.substring(1, line.length - 1);
  return include;
}

function parseGroupDefinition(line) {
  // group definitions may include other groups (@-prefixed) or users
  var kv = line.split('=');
  var groupName = kv[0].substr(1).trim();
  var groupMembers = kv[1].trim().split(' ');
  return new GroupDefinition(groupName, groupMembers);
}

function parseOption(line) {
  // line is an option object
  // options are key-value pairs
  var kv = line.split('=');
  return new Option(kv[0].trim(), kv[1].trim());
}

function parseRule(line) {
  var rule = new Rule();
  // rules have 3 parts:
  var kv = line.split('=');
  var name = kv[0].split(' ');
  // 1. permission
  // R, RW, RW+, -, M?, C?, D?
  rule.permission = name[0];

  // 2. refex
  // regex that matches a ref
  rule.refex = name[1];

  // 3. user/group list
  kv[1].split(' ').forEach(function (symbol) {
    symbol = symbol.trim();

    if(symbol === '') {
      return;
    }

    if(symbol[0] === '@') {
      rule.members.push(new Group(symbol.substr(1)));
    } else {
      rule.members.push(new User(symbol));
    }
  });
  return rule;
}

function decode(buffer, result) {
  var lastRepo = null;
  buffer.split(require('os').EOL)
    // filter comments from the line
    .map(function (line) { return line.split('#')[0].trim(); })
    .filter(empty)
    .forEach(function (line) {
      // if line begins with repo
      if(line.indexOf('repo') === 0) {
        // line begins a repo object
        lastRepo = parseRepo(line.substr('repo'.length).trim());
        result.repos.push(lastRepo);
      }

      // if line begins with include
      else if(line.indexOf('include') === 0) {
        // line is an include object
        result.includes.push(parseInclude(line.substr('include'.length).trim()));
      }

      // else if line begins with a @
      else if(line.indexOf('@') === 0 && line.indexOf('=') !== -1) {
        // line is a group definition
        result.groups.push(parseGroupDefinition(line));
      }

      // if currently in a repo object
      else if(lastRepo !== null) {
        // if line begins with option
        if(line.indexOf('option') === 0) {
          var option = parseOption(line.substr('option'.length).trim());
          lastRepo.options.push(option);
          // else line is a rule
        } else {
          var rule = parseRule(line);
          lastRepo.rules.push(rule);
        }
      }
    });
}

function encode(include) {
  var buffer = '';

  // start with group definitions
  buffer += include.groups.join('\n') + '\n';

  // then write repos
  buffer += include.repos.join('\n') + '\n';

  // finally, includes
  buffer += include.includes.join('\n');

  return buffer;
}



function buildFiles(include) {
  var result = {};
  result[include.file] = encode(include);
  include.includes.forEach(function (include) {
    var files = buildFiles(include);
    Object.keys(files).forEach(function (file) {
      result[file] = files[file];
    });
  });
  return result;
}

var ConfigFile = {
  parseFile: function(file, container) {
    var that = this;
    if(!fs.existsSync(file)) {
      // a missing file is perfectly acceptable
      return Promise.resolve(container);
    }

    return fs.readFileAsync(file).then(function (data) {
      return decode(data.toString(), container);
    }).then(function () {
      var promises = [];
      container.includes.forEach(function (include) {
        promises.push(that.parseFile(include.file, include));
      });
      return Promise.all(promises).then(function () { return container; });
    });
  }
};

module.exports = ConfigFile;
