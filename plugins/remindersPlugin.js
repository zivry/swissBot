var common = require('../lib/common');
var constants = require('../lib/constants');
var usersManager = require('../lib/usersManager');
var persistencyManager = require('../lib/persistencyManager');
var meetingPlugin = require('./meetingPlugin');
var logger = require('../lib/logger');
var _ = require('underscore');
var scheduler = require('node-schedule');

var registrations = {
    meetings: {
        scheduleJob : undefined,
        schedule : '20,50 6-22 * * 0-4',
        registerUsers : []
    },
    agenda : {
        scheduleJob : undefined,
        schedule : '0 7 * * 0-4',
        registerUsers : []
    }
};

module.exports = {
    init : init,
    help: help,
    exec: exec
};

function init() {
    logger.log('info','remindersPlugin init()');
    readObject();
}

function help() {
    return "[de]register [meeting/agenda]";
}

function exec(errorCodes, message, log, postMessage, user) {
    if (message[0] === 'register') {
        if(!isLegalCommand()) {
            return errorCodes.reject_parsing;
        }

        if(message[1] === 'meeting') {
            postMessage('Registering to meetings reminder');
            return register(registrations.meetings, meetingReminderTask);
        }

        if(message[1] === 'agenda') {
            postMessage('Registering to agenda reminder');
            return register(registrations.agenda, agendaReminderTask);
        }
    }
    if (message[0] === 'deregister') {
        if(!isLegalCommand()) {
            return errorCodes.reject_parsing;
        }

        if(message[1] === 'meeting') {
            postMessage('DeRegistering from meetings reminder');
            return deregister(registrations.meetings);
        }

        if(message[1] === 'agenda') {
            postMessage('DeRegistering from agenda reminder');
            return deregister(registrations.agenda);
        }
    }

    return errorCodes.reject_notHandling;


    /////////////////////////////////////
    // functions
    function register(registration, scheduleTask) {
        if(registration.scheduleJob === undefined) {
            registration.scheduleJob = scheduler.scheduleJob(registration.schedule, scheduleTask);
        }

        if(registration.registerUsers.indexOf(user.id) > -1) {
            return postMessage('Already registered.');
        }

        registration.registerUsers.push(user.id);
        writeObject();

        return postMessage('Registered successfully');
    }

    function deregister(registration) {
        registration.registerUsers.splice(registration.registerUsers.indexOf(user.id), 1);
        if(registration.registerUsers.length === 0) {
            scheduler.cancelJob(registration.scheduleJob);
            registration.scheduleJob = undefined;
        }

        writeObject();
        return postMessage('DeRegistered successfully');
    }

    function isLegalCommand() {
        return (message.length > 1 && (message[1] === 'meeting' || message[1] === 'agenda'));
    }
}

function meetingReminderTask() {
    logger.log('info','remindersPlugin: meetingReminderTask wake up');
    _.forEach(registrations.meetings.registerUsers, function(user) {
        var userObject = usersManager.getUserByIDSID(user);
        var nextMeeting = meetingPlugin.getNextMeetingReminder(userObject);
        if(nextMeeting !== '') {
            common.notifyUser(userObject.channelId, '*MEETING REMINDER*\n' + nextMeeting);
        }
    });
}

function agendaReminderTask() {
    logger.log('info','remindersPlugin: agendaReminderTask wake up');
    _.forEach(registrations.agenda.registerUsers, function(user) {
        var userObject = usersManager.getUserByIDSID(user);
        var agenda = meetingPlugin.getAgenda(userObject);
        if(agenda !== '') {
            common.notifyUser(userObject.channelId, '*Your Daily Agenda:*\n' + agenda);
        }
    });
}

function writeObject() {
    var persistencyObject = {
        meeting : registrations.meetings.registerUsers,
        agenda : registrations.agenda.registerUsers
    };
    persistencyManager.storeInPersistency(constants.PERSISTENCY_OBJECTS.REMINDERS, persistencyObject);
}

function readObject() {
    var persistencyObject = persistencyManager.readFromPersistency(constants.PERSISTENCY_OBJECTS.REMINDERS);
    if(persistencyObject.meeting) {
        logger.log('info','remindersPlugin: readObject() - re-registering for meeting: ' + persistencyObject.meeting);
        registrations.meetings.registerUsers = persistencyObject.meeting;
        registrations.meetings.scheduleJob = scheduler.scheduleJob(registrations.meetings.schedule, meetingReminderTask);
    }
    if(persistencyObject.agenda) {
        logger.log('info','remindersPlugin: readObject() - re-registering for agenda: ' + persistencyObject.agenda);
        registrations.agenda.registerUsers = persistencyObject.agenda;
        registrations.agenda.scheduleJob = scheduler.scheduleJob(registrations.agenda.schedule, agendaReminderTask);
    }
}
