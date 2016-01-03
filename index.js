var processHandler = require('./lib/process');
var usersManager = require('./lib/usersManager');
var persistencyManager = require('./lib/persistencyManager');
var constants = require('./lib/constants');
var Slack = require('slack-node');
var _ = require('underscore');

var apiToken = process.env.api_key;
console.info('Slack API Key: ' + apiToken);

var slack = new Slack(apiToken);

/////////////////////////////
// Main Sequence

//getUsers(); // - user this to get new users manually

init();

setInterval(function() {
    readMessages();
    readPrivateMessages();
}, 1000 * 10);


/////////////////////////////
// Functions

function init() {
    persistencyManager.init();
    usersManager.init();
}

function readMessages() {
    slack.api('channels.history', {
        channel : constants.BOT_CHANNEL_ID,
        oldest : usersManager.getTimeStamp(constants.BOT_CHANNEL_NAME),
        count: 1000
    }, processHandler.processChatMessages);
}

function readPrivateMessages() {
    slack.api('im.list', {}, processIMs);
}

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

//function getUsers() {
//    slack.api('users.list', {}, function(err, reponse) {
//        console.log(err);
//        console.log(response);
//    });
//};
