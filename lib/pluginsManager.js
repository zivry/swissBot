module.exports = {
  processMessage : processMessage
};

var Q = require('q');
var Slack = require('slack-node');
var fs = require('fs');
var async = require('async');
var path = require('path');
var baseDir = './plugins';
var plugins = [];
var slack = new Slack(process.env.api_key);
var errorCodes = require('./errorCodes');

var files = fs.readdirSync(baseDir);
files.forEach(function(file) {
  console.info('pluginsManager: Loading plugin ' + file);
  plugins.push( { name : path.basename(file, '.js') , module : require('./../plugins/' + file) });
});

console.info('pluginsManager: Loaded ' + plugins.length + ' plugins');

function processMessage(message) {
  console.info('pluginsManager: processing message - \'' + message[0] + '\'');
  var f = message[0] === 'help' ? help : invokePlugin;
  var createSlackPostCB = function (name) {
    return function(message) {
      console.log('pluginsManager: Sending slack message: ' + message);
      return postSlackMessage(name + ': ' + message);
    }
  };
  var handled = false;
  async.each(plugins,f,checkSomeoneHandeled);
  function checkSomeoneHandeled()
  {
    if(!handled)
    {
      console.log("not handled");
      postSlackMessage("could not understand try:").then(function (){async.each(plugins, help);});
    }
  }
  function help(plugin,callback)
  {
    if(message.length > 1 && message[0] === 'help')
    {
      if(message[1] === plugin.name)
      {
        createSlackPostCB(plugin.name)(plugin.module.help()).then(callback);
      }
      else {
        callback();
      }
    }
    else {
      createSlackPostCB(plugin.name)(plugin.module.help()).then(callback);
    }
  }

  function invokePlugin(plugin, callback) {
    plugin.module.exec(errorCodes,message, createLogCB(plugin.name), createSlackPostCB(plugin.name)).then(markhandled).catch(checkHandled).finally(callback);
    function markhandled()
    {
      console.log("handled");
      handled = true;
    }
    function checkHandled(exception)
    {
      switch (exception) {
        case errorCodes.parsing:
        handled = true;
        return createSlackPostCB(plugin.name)("could not understand try: " + plugin.module.help());
        break;
        default:
        return Q.when();
        break;
      }

    }
    function createLogCB(name) {
      return function(txt) {
        console.info(name + ': ' + txt);
      };
    }


  }
  function postSlackMessage(message)  {
    return Q.nfcall(slack.api, 'chat.postMessage', {
      text: message,
      channel: '#bot_channel'
    }).then(function() {
      console.info('pluginsManager: message \''  + message + '\' sent');
    }).catch(function(err) {
      console.error('Failed to post message', err);
    });
  }
}
