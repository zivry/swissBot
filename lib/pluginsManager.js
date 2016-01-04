var Q = require('q');
var fs = require('fs');
var async = require('async');
var path = require('path');
var baseDir = './plugins';
var plugins = [];
var errorCodes = require('./errorCodes');
var usersManager = require('./usersManager');
var persistencyManager = require('./persistencyManager');
var common = require('./common');
var slack = common.getSlackAPI();
var logger = require('./logger'); 

module.exports = {
    processMessage : processMessage
};


init();

function init() {
    persistencyManager.init();
    usersManager.init();

    var files = fs.readdirSync(baseDir);
    files.forEach(function(file) {
        logger.log('info','pluginsManager: Loading plugin ' + file);
        var plugin = {
            name : path.basename(file, '.js') ,
            module : require('./../plugins/' + file)
        };
        if(plugin.module.init !== undefined) {
            plugin.module.init();
        }
        plugins.push(plugin);
    });

    logger.log('info','pluginsManager: Loaded ' + plugins.length + ' plugins');
}

function processMessage(message, user, channelId) {
    logger.log('info','pluginsManager: processing message - \'' + message[0] + '\'');

    var func = message[0] === 'help' ? help : invokePlugin;

    var handled = false;
    async.each(plugins, func, checkSomeoneHandeled);

    function checkSomeoneHandeled() {
        if(!handled) {
            logger.log('info',"not handled");
            postSlackMessage("could not understand try:").then(function (){async.each(plugins, help);});
        }
    }

    function help(plugin,callback) {
        if(message.length > 1 && message[0] === 'help') {
            if(message[1] === plugin.name) {
                handled = true;
                createSlackPostCB(plugin.name, channelId)(plugin.module.help()).then(callback);
            } else {
                callback();
            }
        } else {
            handled = true;
            createSlackPostCB(plugin.name, channelId)(plugin.module.help()).then(callback);
        }
    }

    function invokePlugin(plugin, callback) {
        plugin.module.exec(errorCodes, message, createLogCB(plugin.name), createSlackPostCB(plugin.name, channelId), user)
                .then(markhandled)
                .catch(checkHandled)
                .finally(callback);

        function markhandled() {
            logger.log('info',"handled by: " +  plugin.name);
            handled = true;
        }

        function checkHandled(exception) {
            switch (exception) {
                case errorCodes.notHandling:
                    return Q.when();
                case errorCodes.parsing:
                    handled = true;
                    return createSlackPostCB(plugin.name, channelId)("could not understand try: " + plugin.module.help());
                default:
                logger.log('info',"caught exception from: "  + plugin.name+ " " + exception);
                return Q.when();
            }
        }

        function createLogCB(name) {
            return function(txt) {
                logger.log('info',name + ': ' + txt);
            };
        }
    }

    function createSlackPostCB(name) {
        return function(message) {
            return postSlackMessage(message +'\n(' + name + ')');

        }
    };

    function postSlackMessage(message)  {
        logger.log('info','pluginsManager: Sending to: ' + channelId + ' slack message: ' + message + '\n(end message)');

        if(process.env.POST_MESSAGE === undefined) {
            return Q.when();
        }
        return Q.nfcall(slack.api, 'chat.postMessage', {
            text: message,
            as_user: true,
            channel: channelId,
            subtype: 'bot_message'
        }).then(function(response) {
            if(response.ok) {
                usersManager.setChannelTimestamp(channelId, response.ts);
                logger.log('info','pluginsManager: message \''  + message + '\' sent');
            }
        }).catch(function(err, response) {
            logger.log('error','Failed to post message', err);
        });
    }
}
