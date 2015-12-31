var Slack = require('slack-node');
var processHandler = require('./lib/process');
var usersManager = require('./lib/usersManager');
var _ = require('underscore');

var apiToken = process.env.api_key;
console.info('Slack API Key: ' + apiToken);
var bot_channel_id = 'C0GPN3KV2';

var CHANNEL_USER = '#bot_channel';

var slack = new Slack(apiToken);

usersManager.init();

//setInterval(readMessages, 1000 * 10);
//setInterval(readPrivateMessages, 1000 * 10);
setInterval(function() {
    readMessages();
    readPrivateMessages();
}, 1000 * 10);

function readMessages() {
    slack.api('channels.history', {
        channel : bot_channel_id,
        oldest : usersManager.getTimeStamp(CHANNEL_USER),
        count: 1000
    }, processHandler.processChatMessages);
}

function readPrivateMessages() {
    slack.api('im.list', {}, processIMs);
};

function processIMs(err, response) {
    if (err) {
        console.error('Failed to read private messages from Slack', err);
        return;
    }
    if(response.ims.length) {
        _.forEach(response.ims,  function(im) {
            if(!usersManager.getUser(im.user)) {
                return;
            }
            usersManager.setUserChannel(im.user, im.id);

            slack.api('im.history', {
                channel : im.id,
                oldest : usersManager.getTimeStamp(im.id),
                count: 1000
            }, processHandler.processPrivateMessages);
        });
    }
};