var Q = require('q');
var _ = require('underscore');
var extend = require('util')._extend;
var jenkins = require('jenkins-api').init('http://rezra3:769c247460c5c507d4d062883421222b@nb-jenkins.intel.com:8080');
// TODO - move jenkins api token and username to env

module.exports = {
  exec: exec,
  help: help
}

function help()
{
  return "build <task name>";
}
function exec(errorCodes,words, log, postMessage) {
    if (words[0] === 'build') {
        if(words.length !== 2)
        {
          return errorCodes.reject_parsing;
        }
        log('fetching ' + words[1] + ' info');
        return Q.nfcall(jenkins.job_info, words[1])
            .then(processInfo)
            .then(runBuild)
            .catch(processError);
    }
    else {
      return errorCodes.reject_notHandling;
    }

    function processInfo(data) {
        var parameters;
        if (data && data.property.length > 1 && data.property[1].parameterDefinitions) {
            parameters = {};
            log('Parsing ' + words[1] + ' parameters');
            _.each(data.property[1].parameterDefinitions, buildParameter);
        }
        return parameters;

        function buildParameter(item) {
            extend(parameters, item.defaultParameterValue);
        }
    }

    function runBuild(parameters) {
        log('will build ' + words[1]);
        if (parameters) {
            return Q.nfcall(jenkins.build, words[1], parameters)
                .then(processSuccess);
        }
        else {
            return Q.nfcall(jenkins.build, words[1])
                .then(processSuccess);
        }

        function processSuccess(data) {
            log(data.message);
            return postMessage(data.message);
        }
    }

    function processError(err) {
        console.error('Failed to build', err);
        return Q.reject();
    }
};
