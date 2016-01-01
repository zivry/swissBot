var _ = require('underscore');
var usersManager = require('../lib/usersManager');
var moment = require('moment');

var common = require('../lib/common');
var constants = require('../lib/constants');

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

        return printNextMeeting(user, postMessage);

        log(message);
    }
    if(message[0] === 'agenda') {
        if(!user) {
            return postMessage('You are not authorized to perform this operation');
        }

        if(message.length > 1 && message[1] === 'tomorrow') {
            return printAgenda('tomorrow', user, postMessage);
        } else {
            return printAgenda('today', user, postMessage);
        }
    }
    return errorCodes.reject_notHandling;

    function printAgenda(day, user, postMessage) {
        postMessage(common.greeting() + user.name + '!, please give me a minute to prepare your agenda for ' + day + '.');
        var startDate =  moment();
        var endDate =  moment().add(1, 'days');


        if(day === 'tomorrow') {
            startDate.add(1, 'days');
            endDate.add(1, 'days');
        }
        var meetings = getMeetings(startDate.format('DD-MMMM-YYYY'),endDate.format('DD-MMMM-YYYY'));
        var message = startDate.format('ddd MMM DD YYYY') + '\n';
        _.forEach(meetings, function(meeting) {
            var location = '\n';
            if(meeting.Location) {
                location = ' (' + meeting.Location  + ')\n';
            }
            message += printHours(parseLetsMeetTime(meeting.StartDateTime), parseLetsMeetTime(meeting.EndDateTime));
            message += ' : ' + meeting.Subject + location;
        });
        return postMessage(message);
    }

    function printNextMeeting(user, postMessage) {

        postMessage(common.greeting() + user.name + '!, please give me a few seconds to find your next meeting.');
        var startDate =  moment();
        var endDate =  moment().add(3, 'days').format('DD-MMMM-YYYY');
        var meetings = getMeetings(startDate.format('DD-MMMM-YYYY'), endDate);
        var currMeeting = 0;
        while(currMeeting < meetings.length) {
            var meeting = meetings[currMeeting];
            var startTime = parseLetsMeetTime(meeting.StartDateTime);
            if(shouldPrintMeeting()) {
                return postMessage(printMeeting(meeting));
            }
            currMeeting++;
        }

        return postMessage('Your calendar is free for the next 3 days');

        function shouldPrintMeeting() {
            if(startTime.getHours() === 0 && startTime.getMinutes() === 0) {
                return false;
            }
            if(!startDate.isBefore(startTime)) {
                return false;
            }
            return true;
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
    }

    function getMeetings(startDate, endDate) {
        var email = user.mail_address;
        var requestor = user.id;

        var url = constants.LETS_MEET_API + '/Reservation/GetMyMeetings?email=' + email + '&fromDate=' + startDate + '&toDate=' + endDate +
                '&emailType=currentUser&getPrivate=true&apiKey=' + constants.LETS_MEET_API_KEY + '&requestor=' + requestor + '&format=JSON&logLevel=0'

        return common.getHttpJSON(url);
    }

    function parseLetsMeetTime(date) {
        return new Date(JSON.parse(date.split("(")[1].split(")")[0]))
    }

    function printHours(startDate, endDate) {
        return '*' + moment(startDate).format('HH:mm') + ' - ' + moment(endDate).format('HH:mm') + '*';
    }
};