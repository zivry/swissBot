var lastTimestamp = require('./lastTimestamp');
var pluginsManager = require('./pluginsManager');
var usersManager = require('./usersManager');
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
            pluginsManager.processMessage(getMessageBody(item.text), usersManager.getUser(item.user));
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

    function getMessageBody(text) {
        return text.replace(new RegExp(bot_name + '[:]*[ ]*'),'' ).toLowerCase().trim().split(/ +/g);
    }
};
