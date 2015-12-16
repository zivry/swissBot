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

var files = fs.readdirSync(baseDir);
files.forEach(function(file) {
    console.info('pluginsManager: Loading plugin ' + file);
    plugins.push( { name : path.basename(file, '.js') , module : require('./../plugins/' + file) });
});

console.info('pluginsManager: Loaded ' + plugins.length + ' plugins');

function processMessage(message) {
    console.info('pluginsManager: processing message - ' + message);
    async.each(plugins, invokePlugin);

    function invokePlugin(plugin, callback) {
        plugin.module(message, createLogCB(plugin.name), createSlackPostCB(plugin.name)).then(callback);

        function createLogCB(name) {
            return function(txt) {
                console.info(name + ': ' + txt);
            };
        }

        function createSlackPostCB(name) {
            return function(message) {
                console.log('pluginsManager: Sending slack message: ' + message);
                return Q.nfcall(slack.api, 'chat.postMessage', {
                    text: name + ': ' + message,
                    channel: '#bot_channel'
                }).then(function() {
                    console.info('pluginsManager: message \''  + message + '\' sent');
                }).catch(function(err) {
                    console.error('Failed to post message', err);
                });
            };
        }
    }
}
