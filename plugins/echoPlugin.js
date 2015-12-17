var Q = require('q');
module.exports = {
  exec: exec,
  help: help
}
function help()
{
  return "echo <message>";
}
function exec(errorCodes,message, log, postMessage) {
  if (message[0] === 'echo') {
    if(message.length === 1 )
    {
      return errorCodes.reject_parsing;
    }
    log(message);
    return postMessage(message.slice(1).join(" "));
  }
  return errorCodes.reject_notHandling;
};
