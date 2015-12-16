var Slack = require('slack-node');
var apiToken = process.env.api_key;
var fs = require('fs');
var _ = require('underscore');

var EventEmitter = require("events").EventEmitter;

console.info('API Key: ' + apiToken);
var bot_channel_id = 'C0GPN3KV2';
var bot_name = '<@U0GPNKZ3P>';
slack = new Slack(apiToken);


// TODO - Add persistency


var events = new EventEmitter();

// TODO - Add dynamic module loading
//var echo = require('./plugins/echoPlugin');
var jenkins = require('./plugins/jenkinsBuildPlugin');
//events.addListener('message', echo);
events.addListener('message', jenkins);

var lastTimestamp = undefined;

//setInterval(readMessages, 1000 * 2);
readMessages();

function readMessages() {
    console.info('Reading messages');
    slack.api('channels.history', {
        channel : bot_channel_id,
        oldest : lastTimestamp || 0
    }, processMessages);

    function processMessages(err, response) {
        if (err) {
            console.error('Failed to read messages from Slack', err);
            return;
        }
        if (response.messages.length) {
            lastTimestamp = response.messages[0].ts;
            var filteredMessages = _.filter(response.messages, filterBotMsg);
            console.log('Got messages ' + filteredMessages.length);
            _.each(filteredMessages, function(item) {
                events.emit('message', item.text.substr(bot_name.length + 2), postMessage)
            });
        }

        function postMessage(message) {
            slack.api('chat.postMessage', {
                text:message,
                channel: '#bot_channel'
            }, function(err){
                if (err) {
                    console.error('Failed to post message', err);
                    return;
                }
            });
        }

        function filterBotMsg(m) {
            return m.text.indexOf(bot_name) === 0;
        }
    }
}


