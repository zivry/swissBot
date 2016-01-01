var constants = require('./constants');
var fs = require('fs');
var _ = require('underscore');

var initTime = Math.floor(new Date().getTime()/1000).toString() + '.00';
var lastTimestamps = {};

module.exports = {
    init : init,
    getUser: getUser,
    getTimeStamp : getTimeStamp,
    setTimeStamp : setTimeStamp,
    setChannelTimestamp : setChannelTimestamp,
    setUserChannel : setUserChannel,
};

function init() {
    if (fs.existsSync('./' + constants.PERSISTENCY_FILENAME)) {
        lastTimestamps = JSON.parse(fs.readFileSync('./' + constants.PERSISTENCY_FILENAME).toString().trim());
        console.info('Reading lastTimestamps from disk');
    }
}

function getUser(userId) {
    return UsersList[userId];
}

function getTimeStamp(userId) {
    if (lastTimestamps[userId]) {
        return lastTimestamps[userId];
    }
    return initTime;
}

function setTimeStamp(userId, timestamp) {
    if(userId === constants.BOT_USER_ID) {
        return;
    }

    console.log('Updating last time stamp: ' + timestamp + ' for userID ' + userId);
    lastTimestamps[userId] = timestamp;
    if(process.env.SKIP_TIMESTAMP_UPDATE === undefined) {
        fs.writeFileSync('./' + constants.PERSISTENCY_FILENAME, JSON.stringify(lastTimestamps));
    }
}

function setChannelTimestamp(channel, ts) {
    var user = _.findWhere(UsersList, {channelId : channel});
    setTimeStamp(user.slack_id, ts);
}

function setUserChannel(userId, channelId) {
    getUser(userId).channelId = channelId;
}

////////////////////////
// Users List

var UsersList = {
    'U0EHK6W13': {
        name : 'Adi',
        id : 'adahan2',
        slack_id : 'U0EHK6W13',
        mail_name: 'Dahan, Adi',
        mail_address: 'adi.dahan@intel.com'
    },
    'U0DKSQK55': {
        name : 'Zamir',
        id : 'zivry',
        slack_id : 'U0DKSQK55',
        mail_name: 'Ivry, Zamir',
        mail_address: 'zamir.ivry@intel.com'
    },
    'U0EHF3LE9': {
        name : 'Alex',
        id : 'abarapp',
        slack_id : 'U0EHF3LE9',
        mail_name: 'Barapp, Alex',
        mail_address: 'alex.barapp@intel.com'
    },
    'U0EHKARF0': {
        name : 'Eyal',
        id : 'egruber',
        slack_id : 'U0EHKARF0',
        mail_name: 'Gruber, Eyal',
        mail_address: 'eyal.gruber@intel.com'
    },
    'U0EEHLEG2': {
        name : 'Roi',
        id : 'rezra3',
        slack_id : 'U0EEHLEG2',
        mail_name: 'Ezra, Roi',
        mail_address: 'roi.ezra@intel.com'
    },
    'U0GQ314BY': {
        name : 'Itamar',
        id : 'ibinyami',
        slack_id : 'U0GQ314BY',
        mail_name: 'Binyamin, Itamar',
        mail_address: 'itamar.binyamin@intel.com'
    },
    'U0EJNSWR3': {
        name : 'Itzik',
        id : 'ihagoel',
        slack_id : 'U0EJNSWR3',
        mail_name: 'Hagoel, Itzik',
        mail_address: 'itzik.hagoel@intel.com'
    },
    'U0EH4UFHR': {
        name : 'Liel',
        id : 'lchayoun',
        slack_id : 'U0EH4UFHR',
        mail_name: 'Chayoun, Liel',
        mail_address: 'liel.chayoun@intel.com'
    },
    'U0EHL98US': {
        name : 'Noam',
        id : 'nambar',
        slack_id : 'U0EHL98US',
        mail_name: 'Ambar, Noam',
        mail_address: 'noam.ambar@intel.com'
    },
    'U0EHJGQE8': {
        name : 'Regev',
        id : 'rbrody',
        slack_id : 'U0EHJGQE8',
        mail_name: 'Brody, Regev',
        mail_address: 'regev.brody@intel.com'
    },
    'U0EHL1Y7K': {
        name : 'Vladimir',
        id : 'vgroisma',
        slack_id : 'U0EHL1Y7K',
        mail_name: 'Groisman, Vladimir',
        mail_address: 'vladimir.groisman@intel.com'
    },
    'U0HHGH30X': {
        name : 'Harel',
        id : 'hopler',
        slack_id : 'U0HHGH30X',
        mail_name: 'Opler, Harel',
        mail_address: 'harel.opler@intel.com'
    }
};