var Q = require('q');

module.exports = function(message, log, postMessage) {
    postMessage(message);
    return Q.when();
};