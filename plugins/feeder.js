var Q = require('q');
var _ = require('underscore');
var extend = require('util')._extend;
var spawn = require('child_process').execFileSync;

// TODO - move jenkins api token and username to env

module.exports = {
  exec: exec,
  help: help
}

function help()
{
  return "feeder <task name pattern> - Return most recent task that answers pattern";
}
function exec(errorCodes,words, log, postMessage) {
    if (words[0] === 'feeder') {
        if(words.length !== 2)
        {
          return errorCodes.reject_parsing;
        }
		var task = spawn("/usr/intel/bin/nbstatus",["tasks","--target","itstl0021:44445", "--number","1","task=~\'" + words[1]+ "\'" ]);
        log('fetching ' + words[1] + ' info');
		postMessage(task);
		return Q.when();
    }
    else {
      return errorCodes.reject_notHandling;
    }

};
