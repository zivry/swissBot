var jenkins = require('jenkins-api').init('http://rezra3:769c247460c5c507d4d062883421222b@nb-jenkins.intel.com:8080');


module.exports = function(message, postMessage) {
    var words = message.split(' ');
    if ((words.length === 2) && (words[0] === 'build')) {
        console.log('jenkinsBuildPlugin: will build ' + words[1]);
        jenkins.job_info(words[1], function(err, data) {
            console.dir(data.property[1].parameterDefinitions);
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
};