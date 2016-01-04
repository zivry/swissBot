var usersManager = require('./usersManager');
var request = require('sync-request');
var Slack = require('slack-node');
var Q = require('q');
var logger = require('./logger');

var apiToken = process.env.api_key;
var slackAPI = new Slack(apiToken);
logger.log('info','Slack API Key: ' + apiToken);

module.exports = {
    getSlackAPI : getSlackAPI,
    notifyUser : notifyUser,
    getHttpJSON : getHttpJSON,
    postHttpJSON : postHttpJSON,
    greeting : greeting
};

function getSlackAPI() {
    return slackAPI;
}

function notifyUser(userChannel, message) {
    logger.log('info','sending message: \n' + message + '\nTo: ' + userChannel);
    if(process.env.POST_MESSAGE === undefined) {
        return Q.when();
    }
    return Q.nfcall(slackAPI.api, 'chat.postMessage', {
        text: message,
        as_user: true,
        channel: userChannel,
        subtype: 'bot_message'
    }).then(function(response) {
        if(response.ok) {
            usersManager.setChannelTimestamp(userChannel, response.ts);
            logger.log('info','pluginsManager: message \''  + message + '\' sent');
        }
    }).catch(function(err, response) {
        logger.log('error','Failed to post message', err);
    });
}

function getHttpJSON(url) {
    var response = request('GET', url);
    var body = JSON.parse(response.getBody('utf8'));
    if (response.statusCode > 299) {
        logger.log('warn','HTTP ERROR ' + response.statusCode + ': %j', body)
    }
    return body;
}

function postHttpJSON(url) {
    try {
        var response = request('POST', url);
        var body = JSON.parse(response.getBody('utf8'));
        if (response.statusCode > 299) {
            logger.log('warn','HTTP ERROR ' + response.statusCode + ': %j', body)
            return undefined;
        }
        return body;
    }
    catch(err) {
        logger.log('info','HTTP post error: ' + err);
        return undefined;
    }
}

function greeting() {
    var now = new Date();
    if(now.getHours() < 12) {
        return 'Good Morning ';
    }
    if(now.getHours() < 16) {
        return 'Good Afternoon ';
    }
    return "Good Night ";
}
