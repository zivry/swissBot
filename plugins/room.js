var Q = require('q');
var _ = require('underscore');
var spawn = require('child_process').execFileSync;
var moment = require('moment');
var usersManager = require('../lib/usersManager');
var request = require('sync-request');

var DEFAULT_BUILDING = 'IDC9';

var LETS_MEET_API = 'http://letsmeet.intel.com:8055/REST';

module.exports = {
	exec: exec,
	help: help
};

function help() {
	return "room [buliding] - Find a room in requested building or in default building:" + DEFAULT_BUILDING;
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
    var now = startDate.getTime();
    var endDate = new Date();
    //manual fix for GMT
    startDate.setHours(startDate.getHours() + 2);
    endDate.setHours(endDate.getHours() + 2);

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
			//		log("s="+ s + "N=" +  now +"E=" + e)
			return (now > s && now < e);
		}

		function getTimeInMilli(d) {
			var s = d.split("(")[1].split("+")[0];
			return s;
		}
	}

	function validateBuildingExists(building) {
		if(building === undefined) {
			return DEFAULT_BUILDING;
		}

		building = 	building.toUpperCase();
        var url = LETS_MEET_API + '/Location/GetBuildings?region=GER&country=Israel&city=IDC&apiKey=24D661C7-0605-4462-8A25-29B2C34653B9&requestor=' + user.id +  '&format=JSON&logLevel=0';
        var buildings = getJSON(url);
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

		var url = 'http://letsmeet.intel.com:8055/REST/Availability/GetRoomAvailabilityByBuildingLocal?organizerMailbox=zamir.ivry@intel.com&buildingName='+ building + '&startTime=' + starttime + '&endTime=' + endtime + '&timeZone=Israel%20Standard%20Time&equipment=&minCapacity=0&apiKey=24D661C7-0605-4462-8A25-29B2C34653B9&requestor=undefined&format=JSON&logLevel=0';
		return getJSON(url);
	}

   function bookRoom(rooms) {

       var currentRoom = 0;

		while(currentRoom < rooms.length) {
            var organizer = user.mail_address;
            var start_time = parseDateString(startDate);
            var end_time = parseDateString(endDate);
            var booked_by = 'Booked by ' + user.mail_name;
            var time_zone = 'Israel Standard Time';
            var api_key = '24D661C7-0605-4462-8A25-29B2C34653B9';
            var requestor = user.id;

            var body = '%3Cdiv%3E---%20--%20--%20--%20--%20--%20--%20---%20Don%27t%20Edit%20or%20Remove%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%3C/div%3E%3Cdiv%3ERooms:CR-IDC9-9107-12%3C/div%3E%3Cdiv%3E--%20--%20--%20--%20--%20--%20--%20----%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20---%3C/div%3E';

            var room_mail = rooms[currentRoom].ResourceEmail;
            var room_name = rooms[currentRoom].ResourceName;
            var options = 'organizerMailbox=' + organizer + '&resourceEmail=' + room_mail + '&resourceName=' + room_name + '&startTime=' + start_time +
                    '&endTime=' + end_time + '&subject=' + booked_by + '&body=' + body + '&timeZone=' + time_zone + '&apiKey=' + api_key +
                    '&requestor=' + requestor + '&format=JSON&logLevel=0';

            var url = 'http://letsmeet.intel.com:8055/REST/Reservation/CreateSingleReservationLocal?' + options;

            console.log('trying to reserve room ' + rooms[currentRoom].ResourceName);
            if(post(url)) {
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

	function post(url) {
        try {
            var response = request('POST', url);
            var body = JSON.parse(response.getBody('utf8'));
            if (response.statusCode > 299) {
                console.log('HTTP ERROR ' + response.statusCode + ': %j', body)
                return undefined;
            }
            return response.getBody('utf8');
        }
	    catch(err) {
            console.log('HTTP post error: ' + err);
            return undefined;
        }
	}

    function getJSON(url) {
        var response = request('GET', url);
        var body = JSON.parse(response.getBody('utf8'));
        if (response.statusCode > 299) {
            console.log('HTTP ERROR ' + response.statusCode + ': %j', body)
        }
        return body;
    }
};
