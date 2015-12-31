var Q = require('q');
var _ = require('underscore');
var spawn = require('child_process').execFileSync;
var moment = require('moment');
var usersManager = require('../lib/usersManager');

var request = require('sync-request');

var DEFAULT_BUILDING = 'IDC9';

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

	var now = (new Date().getTime())+65*60*1000*2;

	//var building = message.length >  1 ? message[1] : 'IDC9'
	var rooms = getRooms(building);
    var matchingRoom = _.chain(rooms).filter(filter);
    var	emptyRoomName = matchingRoom.pluck("ResourceName").value();
	if(emptyRoomName.length === 0) {
		postMessage("could not find empty rooms in:" + building);
	} else {
		postMessage("found the following rooms:" + emptyRoomName);
        bookRoom(matchingRoom.value()[0]);
	}

	return Q.when();

	function filter(row) {
		return _.filter(row.FreeBusy,arrayFilter).length === 0;
		function arrayFilter(timeRange) {
			e = getTimeInMilli(timeRange.EndTime);
			s = getTimeInMilli(timeRange.StartTime);
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
        var username = usersManager.getNegotiator().username;
		var url = 'letsmeet.intel.com:8055/REST/Location/GetLocationsMetaData?apiKey=24D661C7-0605-4462-8A25-29B2C34653B9&requestor=' + username+  '&format=json&logLevel=4';
		//var buildings = JSON.parse(spawn("/usr/intel/bin/curl",["-s","--ntlm","-u",username+":"+password,'letsmeet.intel.com:8055/REST/Location/GetLocationsMetaData?apiKey=24D661C7-0605-4462-8A25-29B2C34653B9&requestor='+username+  '&format=json&logLevel=4']));

		var buildings = getData(url);
		var buildingExists = _.chain(buildings).map(function(item){return item.Sites}).flatten().pluck("Buildings").flatten().pluck("BuildingName").contains(building).value();
		if(buildingExists) {
			return building;
		}

		postMessage("There is no such building: *" + building + "*");
		return undefined;
	}

	function getRooms(building) {
		log("will find a room in building:" + building);

		var starttime = moment().add(-10,'hours').format().split("+")[0];
		var endtime = moment().add(10,'hours').format().split("+")[0];

		//return JSON.parse(spawn("/usr/intel/bin/curl",["-s","--ntlm","-u",username+":"+password,'letsmeet.intel.com:8055/REST/Availability/GetRoomAvailabilityByBuildingLocal?organizerMailbox=zamir.ivry@intel.com&buildingName='+ building+ '&startTime=' + starttime + '&endTime=' + endtime + '&timeZone=Israel%20Standard%20Time&equipment=&minCapacity=0&apiKey=24D661C7-0605-4462-8A25-29B2C34653B9&requestor=undefined&format=JSON&logLevel=0']));
		var url = 'letsmeet.intel.com:8055/REST/Availability/GetRoomAvailabilityByBuildingLocal?organizerMailbox=zamir.ivry@intel.com&buildingName='+ building + '&startTime=' + starttime + '&endTime=' + endtime + '&timeZone=Israel%20Standard%20Time&equipment=&minCapacity=0&apiKey=24D661C7-0605-4462-8A25-29B2C34653B9&requestor=undefined&format=JSON&logLevel=0'
		return getData(url);
	}

	function getData(url) {
		var n = usersManager.getNegotiator();
		var username = n.username;
		var password = n.password;

		return JSON.parse(spawn("/usr/intel/bin/curl",["-s", "--ntlm", "-u", username + ":" + password, url]));
	}
 
   function bookRoom(room) {

		var startDate = new Date();
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
		
		var organizer = user.mail_address;//'adi.dahan@intel.com';
        var room_mail = room.ResourceEmail;//'IDC99108@intel.com';
        var room_name = room.ResourceName;//'CR-IDC9-9108-12';
        var start_time = parseDateString(startDate);//'2015-12-30T17:30:00';
        var end_time = parseDateString(endDate);//'2015-12-30T18:00:00';
        var booked_by = 'Booked by ' + user.mail_name;//Dahan, Adi';
        var time_zone = 'Israel Standard Time';
        var api_key = '24D661C7-0605-4462-8A25-29B2C34653B9';
        var requestor = user.id;//'adahan2';

        var body = '%3Cdiv%3E---%20--%20--%20--%20--%20--%20--%20---%20Don%27t%20Edit%20or%20Remove%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%3C/div%3E%3Cdiv%3ERooms:CR-IDC9-9107-12%3C/div%3E%3Cdiv%3E--%20--%20--%20--%20--%20--%20--%20----%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20--%20---%3C/div%3E';
        var options = 'organizerMailbox=' + organizer + '&resourceEmail=' + room_mail + '&resourceName=' + room_name + '&startTime=' + start_time +
                '&endTime=' + end_time + '&subject=' + booked_by + '&body=' + body + '&timeZone=' + time_zone + '&apiKey=' + api_key +
                '&requestor=' + requestor + '&format=JSON&logLevel=0';

        var url = 'http://letsmeet.intel.com:8055/REST/Reservation/CreateSingleReservationLocal?' + options;
		post(url);
    }

	function parseDateString(date) {
		var dateStr = date.toISOString();
		return dateStr.substring(0, dateStr.indexOf('.'));
	}

	function post(url) {
	    var response = request('POST', url);
	    if (response.statusCode > 299) {
	        console.log('HTTP ERROR ' + response.statusCode + ': %j', response.body)
	    }
	    return response.getBody('utf8');
	}
};
