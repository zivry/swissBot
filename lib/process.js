var pluginsManager = require('./pluginsManager');
var usersManager = require('./usersManager');
var _ = require('underscore');
var bot_name = '<@U0GPNKZ3P>';
var CHANNEL_ID = '#bot_channel';

module.exports = {
    processChatMessages : processChatMessages,
    processPrivateMessages : processPrivateMessages
};

function processChatMessages(err, response) {
    if (err) {
        console.error('Failed to read messages from Slack', err);
        return;
    }

    _processMessages(response.messages, filterBotMsg, getMessageBody, CHANNEL_ID);

    function filterBotMsg(m) {
        return m.text.indexOf(bot_name) === 0;
    }

    function getMessageBody(text) {
        return text.replace(new RegExp(bot_name + '[:]*[ ]*'),'' ).toLowerCase().trim().split(/ +/g);
    }
};

function processPrivateMessages(err, response) {
    if (err) {
        console.error('Failed to read messages from Slack', err);
        return;
    }

    _processMessages(response.messages, filterBotMessages, getMessageBody);

    function getMessageBody(text) {
        return text.toLowerCase().trim().split(/ +/g);
    }

    function filterBotMessages(message) {
        return (message.user && message.user !== 'U0GPNKZ3P');
    }
}

function _processMessages(messages, filterFunction, getMessageBody, channel) {
    if (messages.length) {
        var filteredMessages = _.filter(messages, filterFunction);
        console.log('Got messages ' + messages.length);
        _.each(filteredMessages, function(item) {
            var user = usersManager.getUser(item.user);
            if(!channel) {
                channel = user.channelId;
            }
            usersManager.setTimeStamp(channel, messages[0].ts);
            pluginsManager.processMessage(getMessageBody(item.text), user, channel);
        });
    }
}