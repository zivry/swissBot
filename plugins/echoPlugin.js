var Q = require('q');

module.exports = function(message, log, postMessage) {
    log(message);
    //return postMessage(message);
    return Q.when();
};