var _ = require('underscore');
var usersManager = require('../lib/usersManager');
var moment = require('moment');

var common = require('../lib/common');
var constants = require('../lib/constants');

module.exports = {
    exec: exec,
    help: help,
    getNextMeetingReminder : getNextMeetingReminder,
    getAgenda : getAgenda
};

function help() {
    return "meeting\nagenda\nagenda tomorrow";
}

function exec(errorCodes, message, log, postMessage, user) {
    if (message[0] === 'meeting') {
        if(!user) {
            return postMessage('You are not authorized to perform this operation');
        }

        return execNextMeeting(user, postMessage);
    }
    if(message[0] === 'agenda') {
        if(!user) {
            return postMessage('You are not authorized to perform this operation');
        }

        if(message.length > 1 && message[1] === 'tomorrow') {
            return execAgenda('tomorrow', user, postMessage);
        } else {
            return execAgenda('today', user, postMessage);
        }
    }
    return errorCodes.reject_notHandling;

    function execAgenda(day, user, postMessage) {
        postMessage(common.greeting() + user.name + '!, please give me a minute to prepare your agenda for ' + day + '.');
        var startDate =  moment();
        var endDate =  moment().add(1, 'days');


        if(day === 'tomorrow') {
            startDate.add(1, 'days');
            endDate.add(1, 'days');
        }
        var meetings = getMeetings(user, startDate.format('DD-MMMM-YYYY'),endDate.format('DD-MMMM-YYYY'));
        var message = startDate.format('ddd MMM DD YYYY') + '\n';
        message += printAgenda(meetings);
        //_.forEach(meetings, function(meeting) {
        //    var location = '\n';
        //    if(meeting.Location) {
        //        location = ' (' + meeting.Location  + ')\n';
        //    }
        //    message += printHours(parseLetsMeetTime(meeting.StartDateTime), parseLetsMeetTime(meeting.EndDateTime));
        //    message += ' : ' + meeting.Subject + location;
        //});
        return postMessage(message);
    }

    function execNextMeeting(user, postMessage) {

        postMessage(common.greeting() + user.name + '!, please give me a few seconds to find your next meeting.');
        var startDate =  moment();
        var endDate =  moment().add(3, 'days').format('DD-MMMM-YYYY');
        var meetings = getMeetings(user, startDate.format('DD-MMMM-YYYY'), endDate);
        var currMeeting = 0;
        while(currMeeting < meetings.length) {
            var meeting = meetings[currMeeting];
            var startTime = parseLetsMeetTime(meeting.StartDateTime);
            if(shouldPrintMeeting(startTime, startDate)) {
                return postMessage(printMeeting(meeting));
            }
            currMeeting++;
        }

        return postMessage('Your calendar is free for the next 3 days');
    }
};

function getNextMeetingReminder(user) {
    var startDate =  moment();
    var endDate =  moment().add(30, 'minutes').format('DD-MMMM-YYYY');
    var nextMeetings = getMeetings(user, startDate.format('DD-MMMM-YYYY'), endDate);
    var message = '';
    _.forEach(nextMeetings,  function(meeting) {
        var startTime = parseLetsMeetTime(meeting.StartDateTime);
        if(shouldPrintMeeting(startTime, startDate)) {
            message += printMeeting(meeting) + '\n';
        }
    });
    return message;
}

function getAgenda(user) {
    var startDate =  moment();
    var endDate =  moment().add(1, 'days');
    var meetings = getMeetings(user, startDate.format('DD-MMMM-YYYY'),endDate.format('DD-MMMM-YYYY'));
    return printAgenda(meetings);
}

function getMeetings(user, startDate, endDate) {
    var email = user.mail_address;
    var requestor = user.id;

    var url = constants.LETS_MEET_API + '/Reservation/GetMyMeetings?email=' + email + '&fromDate=' + startDate + '&toDate=' + endDate +
            '&emailType=currentUser&getPrivate=true&apiKey=' + constants.LETS_MEET_API_KEY + '&requestor=' + requestor + '&format=JSON&logLevel=0';

    return common.getHttpJSON(url);
}

function printAgenda(meetings) {
    var message = '';
    _.forEach(meetings, function(meeting) {
        var location = '\n';
        if(meeting.Location) {
            location = ' (' + meeting.Location  + ')\n';
        }
        message += printHours(parseLetsMeetTime(meeting.StartDateTime), parseLetsMeetTime(meeting.EndDateTime));
        message += ' : ' + meeting.Subject + location;
    });
    return message;
}

function printMeeting(meeting) {
    var printableMeeting = printDate(meeting.StartDateTime, meeting.EndDateTime);
    printableMeeting += '\n' + meeting.Subject;
    if(meeting.Location) {
        printableMeeting += '\nAt: ' + meeting.Location;
    }
    printableMeeting += '\nBy: ' + meeting.Organizer.Name;
    return printableMeeting;
}

function printDate(startDateTime, endDateTime) {
    var startDate = parseLetsMeetTime(startDateTime);
    var endDate = parseLetsMeetTime(endDateTime);

    var displayDate = '*' + startDate.toDateString() + '*\n';
    displayDate += printHours(startDate, endDate);

    return displayDate;
}

function printHours(startDate, endDate) {
    return '*' + moment(startDate).format('HH:mm') + ' - ' + moment(endDate).format('HH:mm') + '*';
}

function parseLetsMeetTime(date) {
    return new Date(JSON.parse(date.split("(")[1].split(")")[0]))
}

function shouldPrintMeeting(startTime, startDate) {
    if(startTime.getHours() === 0 && startTime.getMinutes() === 0) {
        return false;
    }
    return startDate.isBefore(startTime);
}