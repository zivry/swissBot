var Q = require('q');
module.exports = {
  exec: exec,
  help: help
}
function help()
{
  return "echo <message>";
}
function exec(message, log, postMessage) {
    if ((message.length === 2) && (message[0] === 'echo')) {
    log(message);
    return postMessage(message);
  }
  return Q.when(false);
};
