var fs = require('fs');
var _ = require('underscore');
var persistenceFileName = 'persistence.txt';
var lastTimestamps = {};

var CHANNEL_USER = 'channel';
var BOT_USER = 'U0GPNKZ3P';

var initTime = Math.floor(new Date().getTime()/1000).toString() + '.00';

module.exports = {
    init : init,
    getUser: getUser,
    getTimeStamp : getTimeStamp,
    setTimeStamp : setTimeStamp,
    setChannelTimestamp : setChannelTimestamp,
    setUserChannel : setUserChannel,
    getNegotiator: getNegotiator
};

function init() {
    if (fs.existsSync('./' + persistenceFileName)) {
        lastTimestamps = JSON.parse(fs.readFileSync('./' + persistenceFileName).toString().trim());
        console.info('Reading lastTimestamps from disk');
    }
}

function getUser(userId) {
    return UsersList[userId];
}

function getTimeStamp(userId) {
    if(!userId) {
        userId = CHANNEL_USER;
    }

    if (lastTimestamps[userId]) {
        return lastTimestamps[userId];
    }
    return initTime;
}

function setTimeStamp(userId, timestamp) {
    if(userId === BOT_USER) {
        return;
    }

    if(!userId) {
        userId = CHANNEL_USER;
    }
    console.log('Updating last time stamp: ' + timestamp + ' for userID ' + userId);
    lastTimestamps[userId] = timestamp;
    if(process.env.SKIP_TIMESTAMP_UPDATE !== undefined) {
        fs.writeFileSync('./' + persistenceFileName, JSON.stringify(lastTimestamps));
    }
}

function setChannelTimestamp(channel, ts) {
    var user = _.findWhere(UsersList, {channelId : channel});
    setTimeStamp(user.slack_id, ts);
}

function getNegotiator() {
    return {
        username : 'sys_nbflow',
        password : ''//DONT COMMIT THIS LINE!
    }
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
        calendarId : 'AQMkADkzN2M4MmRiLTVlOWYtNDk2YS04NDc1LTcyYWNiMjUyYjhiMgAuAAADvvZgVHJAnkWtVNQPHGnj8wEAKKOkaMsAEkKfZA9y85QsUAA5JrpsqQAAAA=='
    },
    'U0DKSQK55': {
        name : 'Zamir',
        id : 'zivry',
        slack_id : 'U0DKSQK55',
        calendarId : 'AAMkADUwMWJmMDJjLTA4OTQtNGZjMy1iOGJhLTBjOWY0MzA0ZGZhMAAuAAAAAABC6O6LBqKfS5oVUtYELfGcAQCOjWZbQHYEQq1GCB2ElQWvAAADg7uDAAA='
    },
    'U0EHF3LE9': {
        name : 'Alex',
        id : 'abarapp',
        slack_id : 'U0EHF3LE9',
        calendarId : ''
    },
    'U0EHKARF0': {
        name : 'Eyal',
        id : 'egruber',
        slack_id : 'U0EHKARF0',
        calendarId : ''
    },
    'U0EEHLEG2': {
        name : 'Roi',
        id : 'rezra3',
        slack_id : 'U0EEHLEG2',
        calendarId : ''
    },
    'U0GQ314BY': {
        name : 'Itamar',
        id : 'ibinyami',
        slack_id : 'U0GQ314BY',
        calendarId : ''
    },
    'U0EJNSWR3': {
        name : 'Itzik',
        id : '',
        slack_id : 'U0EJNSWR3',
        calendarId : ''
    },
    'U0EH4UFHR': {
        name : 'Liel',
        id : 'lchayoun',
        slack_id : 'U0EH4UFHR',
        calendarId : ''
    },
    'U0EHL98US': {
        name : 'Noam',
        id : 'nambar',
        slack_id : 'U0EHL98US',
        calendarId : ''
    },
    'U0EHJGQE8': {
        name : 'Regev',
        id : 'rbrody',
        slack_id : 'U0EHJGQE8',
        calendarId : 'AAMkAGIyMDZlMjU5LTZhOTUtNDk1MS04OTc0LTgwZDI3MTc0Y2FhNgAuAAAAAACmBIetuzVQSIa7EAOevLHiAQAxT3goD8U2RZjY5nVa3u/ZAAAA44tbAAA='
    },
    'U0EHL1Y7K': {
        name : 'Vladimir',
        id : 'vgroisma',
        slack_id : 'U0EHL1Y7K',
        calendarId : ''
    }
};