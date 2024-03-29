var constants = require('./constants');
var persistencyManager = require('./persistencyManager');
var _ = require('underscore');
var logger = require('./logger');

var initTime = Math.floor(new Date().getTime()/1000).toString() + '.00';
var lastTimestamps = {};

module.exports = {
    init : init,
    getUser: getUser,
    getTimeStamp : getTimeStamp,
    setTimeStamp : setTimeStamp,
    setChannelTimestamp : setChannelTimestamp,
    setUserChannel : setUserChannel,
    getUserByIDSID : getUserByIDSID
};

function init() {
    lastTimestamps = persistencyManager.readFromPersistency(constants.PERSISTENCY_OBJECTS.USERS);
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

    logger.log('info','Updating last time stamp: ' + timestamp + ' for userID ' + userId);
    lastTimestamps[userId] = timestamp;
    persistencyManager.storeInPersistency(constants.PERSISTENCY_OBJECTS.USERS, lastTimestamps);
}

function setChannelTimestamp(channel, ts) {
    var user = _.findWhere(UsersList, {channelId : channel});
    setTimeStamp(user.slack_id, ts);
}

function setUserChannel(userId, channelId) {
    getUser(userId).channelId = channelId;
}

function getUserByIDSID(userId) {
    return _.findWhere(UsersList, {id : userId});
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
    },
    'U0KGS4UPJ': {
        name : 'Eli',
        id : 'no_unix',
        slack_id : 'U0KGS4UPJ',
        mail_name: 'Eliezer, Eli',
        mail_address: 'eli.eliezer@intel.com'
    }

};
