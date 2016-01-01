var common = require('../lib/common');
var constants = require('../lib/constants');

var Q = require('q');
var _ = require('underscore');
var moment = require('moment');

module.exports = {
	exec: exec,
	help: help
};

function help() {
	return "room [buliding] - Find a room in requested building or in default building:" + constants.DEFAULT_BUILDING;
}

function exec(errorCodes,message, log, postMessage, user) {

	if(message[0] !== 'room'  ) {
		return errorCodes.reject_notHandling;
	}

	var building = validateBuildingExists(message[1]);
	if(building === undefined) {
		return errorCodes.reject_parsing;
	}

    var rooms = getRooms(building);

    var startDate = new Date();

    var endDate = new Date();
    //manual fix for GMT
    startDate.setHours(startDate.getHours() + 2);
    endDate.setHours(endDate.getHours() + 2);

    var now = startDate.getTime();
    if(startDate.getMinutes() < 30) {
        startDate.setMinutes(0);
        endDate.setMinutes(30);
    } else {
        startDate.setMinutes(30);
        endDate.setMinutes(0);
        endDate.setHours(endDate.getHours() + 1);
    }

    var matchingRoom = _.chain(rooms).filter(filter);
    var	emptyRoomName = matchingRoom.pluck("ResourceName").value();
	if(emptyRoomName.length === 0) {
		postMessage("could not find empty rooms in:" + building);
	} else {
		postMessage("found the following rooms:" + emptyRoomName);
        bookRoom(matchingRoom.value());
	}

	return Q.when();

    //////////////////////////////
    // Functions

	function filter(row) {
		return _.filter(row.FreeBusy,arrayFilter).length === 0;
		function arrayFilter(timeRange) {
			var e = getTimeInMilli(timeRange.EndTime);
			var s = getTimeInMilli(timeRange.StartTime);
			return (now > s && now < e);
		}

		function getTimeInMilli(d) {
			return d.split("(")[1].split("+")[0];
		}
	}

	function validateBuildingExists(building) {
		if(building === undefined) {
			return constants.DEFAULT_BUILDING;
		}

		building = 	building.toUpperCase();
        var url = constants.LETS_MEET_API + '/Location/GetBuildings?region=GER&country=Israel&city=IDC&apiKey=' + constants.LETS_MEET_API_KEY +
                '&requestor=' + user.id +  '&format=JSON&logLevel=0';
        var buildings = common.getHttpJSON(url);
        if(buildings.indexOf(building) >= 0) {
            return building;
        }

		postMessage("There is no such building: *" + building + "*\nThe following buildings are available in your campus:\n" + buildings.join('\n'));
		return undefined;
	}

	function getRooms(building) {
		log("will find a room in building:" + building);

		var starttime = moment().add(-10,'hours').format().split("+")[0];
		var endtime = moment().add(10,'hours').format().split("+")[0];
        var organizer = user.mail_address;
        var requestor = user.id;

		var url = constants.LETS_MEET_API + '/Availability/GetRoomAvailabilityByBuildingLocal?organizerMailbox=' + organizer + '&buildingName=' +
                building + '&startTime=' + starttime + '&endTime=' + endtime + '&timeZone=Israel%20Standard%20Time&equipment=&minCapacity=0&apiKey=' +
                constants.LETS_MEET_API_KEY + '&requestor=' + requestor + '&format=JSON&logLevel=0';
		return common.getHttpJSON(url);
	}

   function bookRoom(rooms) {

       var currentRoom = 0;

		while(currentRoom < rooms.length) {
            var organizer = user.mail_address;
            var start_time = parseDateString(startDate);
            var end_time = parseDateString(endDate);
            var booked_by = 'Booked by ' + user.mail_name;
            var time_zone = 'Israel Standard Time';
            var requestor = user.id;
            var room_mail = rooms[currentRoom].ResourceEmail;
            var room_name = rooms[currentRoom].ResourceName;

            var body = '%3Cdiv%3E---%20--%20--%20--%20--%20--%20--%20---%20Don%27t%20Edit%20or%20Remove%20--%20--%20--%20--%20--%20--%20--%20--' +
                    '%20--%20--%3C/div%3E%3Cdiv%3ERooms:CR-IDC9-9107-12%3C/div%3E%3Cdiv%3E--%20--%20--%20--%20--%20--%20--%20----%20--%20--%20--' +
                    '%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20---%3C/div%3E';

            var options = 'organizerMailbox=' + organizer + '&resourceEmail=' + room_mail + '&resourceName=' + room_name + '&startTime=' + start_time +
                    '&endTime=' + end_time + '&subject=' + booked_by + '&body=' + body + '&timeZone=' + time_zone + '&apiKey=' + constants.LETS_MEET_API_KEY +
                    '&requestor=' + requestor + '&format=JSON&logLevel=0';

            var url = constants.LETS_MEET_API + '/Reservation/CreateSingleReservationLocal?' + options;

            console.log('trying to reserve room ' + rooms[currentRoom].ResourceName);
            if(common.postHttpJSON(url)) {
                postMessage('Successfully booked:' + rooms[currentRoom].ResourceName);
                return;
            }
            currentRoom++;
        }
       postMessage('Unable to book room');
    }

	function parseDateString(date) {
		var dateStr = date.toISOString();
		return dateStr.substring(0, dateStr.indexOf('.'));
	}
};
