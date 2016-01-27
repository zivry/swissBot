var processhandler = require('./lib/process');
var usersmanager = require('./lib/usersmanager');
var constants = require('./lib/constants');
var common = require('./lib/common');
var _ = require('underscore');

var slack = common.getslackapi();

/////////////////////////////
// main sequence

//getusers(); // - user this to get new users manually

setinterval(function() {
    readmessages();
    readprivatemessages();
}, 1000 * 10);


/////////////////////////////
// functions

function readmessages() {
    slack.api('channels.history', {
        channel : constants.bot_channel_id,
        oldest : usersmanager.gettimestamp(constants.bot_channel_name),
        count: 1000
    }, processhandler.processchatmessages);
}

function readprivatemessages() {
    slack.api('im.list', {}, processims);
}

function processims(err, response) {
    if (err) {
        console.error('failed to read private messages from slack', err);
        return;
    }
    if(response.ims.length) {
        _.foreach(response.ims,  function(im) {
            if(!usersmanager.getuser(im.user)) {
                return;
            }
            usersmanager.setuserchannel(im.user, im.id);

            slack.api('im.history', {
                channel : im.id,
                oldest : usersmanager.gettimestamp(im.id),
                count: 1000
            }, processhandler.processprivatemessages);
        });
    }
};

function getusers() {
    slack.api('users.list', {}, function(err, reponse) {
        console.log(err);
        console.log(response);
    });
};
