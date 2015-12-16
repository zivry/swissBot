module.exports = function(message, postMessage) {
    console.info('Got event with message ' + message);
    postMessage(message);
};