var lastTimestamp = require('./lastTimestamp');
var pluginsManager = require('./pluginsManager');
var _ = require('underscore');
var bot_name = '<@U0GPNKZ3P>';

module.exports =
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
            pluginsManager.processMessage(item.text.replace(new RegExp(bot_name + '[:]*[ ]*'),'' ).toLowerCase().split(/ +/g));
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
