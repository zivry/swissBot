var exchanger = require('exchanger');
var _ = require('underscore');

module.exports = {
  exec: exec,
  help: help
};

function help() {
    return "meeting\nagenda\nagenda tomorrow";
}

function exec(errorCodes, message, log, postMessage, user) {
    if (message[0] === 'meeting') {
        if(!user) {
            return postMessage('You are not authorized to perform this operation');
        }

        return printNextMeeting(user, postMessage, log);

        log(message);
    }
    if(message[0] === 'agenda') {
        if(!user) {
            return postMessage('You are not authorized to perform this operation');
        }

        if(message.length > 1 && message[1] === 'tomorrow') {
            return printAgenda('tomorrow', user, postMessage, log);
        } else {
            return printAgenda('today', user, postMessage, log);
        }
    }
    return errorCodes.reject_notHandling;
};

function printAgenda(day, user, postMessage, log) {
    var start = new Date();
    start.setHours(6);
    start.setMinutes(0);

    if(day === 'tomorrow') {
        start = _addDays(start, 1);
    }
    var end = _addDays(start, 1);

    _getMeetings(start, end, user, handleMeeting);

    return postMessage(_greeting() + user.name + '!, please give me a minute to prepare your agenda for ' + day + '.');

    function handleMeeting(err, meetings) {
        if(err) {
            if(err.message === 'No events') {
                postMessage('Looks like your calendar is free for today.\nHave fun! :)');
            } else {
                log('error: ' + err);
            }
            return;
        }

        var message = start.toDateString() + '\n';
        _.forEach(meetings, function(meeting) {
            message += _printHours(new Date(meeting.start), new Date(meeting.end));
            message += ' : ' + meeting.subject + '\n';
        });
        postMessage(message);

    }
}

function printNextMeeting(user, postMessage, log) {
    var now = new Date();
    var next = _addDays(now,  3);
    _getMeetings(now, next, user, handleMeeting);

    return postMessage(_greeting() + user.name + '!, please give me a few seconds to find your next meeting.');

    function handleMeeting(err, meetings) {
        if(err) {
            if(err.message === 'No events') {
                postMessage('You have no upcoming meetings in the next 3 days.\nHave fun! :)');
            } else {
                log('error: ' + err);
            }
            return;
        }
        if(meetings && meetings.length > 0) {
            var allDay = '';
            var nextMeeting = '';
            for(var i=0; i < meetings.length; i++) {
                if(meetings[i].allday) {
                    allDay += meetings[i].subject + '\n';
                }else {
                    nextMeeting = _printMeeting(meetings[0]);
                    break;
                }
            }
            if(nextMeeting !== '') {
                postMessage('Your next meeting is:\n' + nextMeeting);
            }
            if(allDay !== '') {
                postMessage('You also have all days event(s) :\n' + allDay);
            }
        }
    }
}

function _getMeetings(now, next, user, callback) {
    var options = {
        url: 'webmail.intel.com',
        username: user.id,
        password: user.password
    };

    exchanger.initialize(options, function() {
        exchanger.getCalendarItems({id : user.calendarId}, now.toISOString(), next.toISOString(), callback);
    });
}

function _printMeeting(meeting) {
    var printableMeeting = _printDate(meeting.start, meeting.end);
    printableMeeting += '\n' + meeting.subject;
    if(typeof meeting.location === 'string') {
        printableMeeting += '\nAt: ' + meeting.location;
    }
    printableMeeting += '\nBy: ' + meeting.organizer;
    return printableMeeting;
}

function _printDate(startDateTime, endDateTime) {
    var startDate = new Date(startDateTime);
    var endDate = new Date(endDateTime);

    var displayDate = startDate.toDateString() + '\n';
    displayDate += _printHours(startDate, endDate);

    return displayDate;
}

function _printHours(startDate, endDate) {
    var hours = startDate.getHours()  + ':' + _minutes(startDate);
    hours += ' - ' + endDate.getHours()  + ':' + _minutes(endDate);

    return hours;

    function _minutes(dateTime) {
        return (dateTime.getMinutes() === 0) ? '00' : dateTime.getMinutes();
    }
}

function _addDays(date, days) {
    var resultDate = new Date(date);
    var day = 1000 * 60 * 60 * 24;
    return new Date(resultDate.getTime() + day * days);
}

function _greeting() {
    var now = new Date();
    if(now.getHours() < 12) {
        return 'Good Morning ';
    }
    if(now.getHours() < 16) {
        return 'Good Afternoon ';
    }
    return "Good Night ";
}