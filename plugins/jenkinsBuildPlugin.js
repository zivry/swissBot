var Q = require('q');
var jenkins = require('jenkins-api').init('http://rezra3:769c247460c5c507d4d062883421222b@nb-jenkins.intel.com:8080');
// TODO - move jenkins api token and username to env

module.exports = function(message, log, postMessage) {
    var deffer = Q.defer();
    var words = message.split(' ');
    if ((words.length === 2) && (words[0] === 'build')) {
        log('will build ' + words[1]);
        jenkins.job_info(words[1], function(err, data) {
            console.dir(data.property[1].parameterDefinitions);
            deffer.resolve();
        });
        /*
        jenkins.build(words[1], {revision: 'HEAD'}, function(err, data) {
            if (err){
                console.error('jenkinsBuildPlugin:', err);
                return;
            }
            console.info(data.message);
            postMessage('jenkinsBuildPlugin: ' + data.message);
        });
        */
    }
    else {
        deffer.reject();
    }
    return deffer.promise;
};