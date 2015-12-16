var Slack = require('slack-node');
var apiToken = process.env.api_key;

var _ = require('underscore');
var lastTimestamp = require('./lib/lastTimestamp');
var pluginsManager = require('./lib/pluginsManager');

console.info('Slack API Key: ' + apiToken);
var bot_channel_id = 'C0GPN3KV2';
var bot_name = '<@U0GPNKZ3P>';
var slack = new Slack(apiToken);


//setInterval(readMessages, 1000 * 2);
readMessages();

function readMessages() {
    console.info('Reading messages');
    slack.api('channels.history', {
        channel : bot_channel_id,
        oldest : lastTimestamp.get()
    }, processMessages);

    function processMessages(err, response) {
        if (err) {
            console.error('Failed to read messages from Slack', err);
            return;
        }
        if (response.messages.length) {
            lastTimestamp.update(response.messages[0].ts);
            var filteredMessages = _.filter(response.messages, filterBotMsg);
            console.log('Got messages ' + filteredMessages.length);
            _.each(filteredMessages, function(item) {
                pluginsManager.processMessage(item.text.substr(bot_name.length + 2));
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