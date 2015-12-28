var Q = require('q');
var _ = require('underscore');
var url = require('url');
var spawn = require('child_process').execFileSync;
var moment = require('moment');

module.exports = {
exec: exec,
	  help: help
}
function help()
{
		return "meeting [username]";
}
var propertiesObject = { fromDate: '17-Dec-2015',
		toDate: '17-Dec-2015',
		fromTime: '15:00',
		toTime: '15:30',
		timeZone: 'Israel Standard Time',
		building: 'IDC9',
		floor: 'All',
		nd: '1450348670545',
		rows: '100',
		page: '1',
		searchIndex: 'ResourceName',
		sortOrder: 'asc',
		_: '1450348670547' };
var username = 'zivry';
var password = 'mr77130%';
var s = "https://" + username + ":" + password + "@letsmeetrooms.intel.com/Dashboard/AllReservationDetailsPartial";
function exec(errorCodes,message, log, postMessage) {
		if(message[0] !== 'room'  )
		{
		 return errorCodes.reject_notHandling;
		}

		log("will find a room");
		var now = (new Date().getTime())+65*60*1000*2;
		postMessage("looking for a free room "); 
		var starttime = moment().add(-10,'hours').format().split("+")[0];
		var endtime = moment().add(10,'hours').add(11,'minutes').format().split("+")[0];

		log(starttime);
		log(endtime);
		var result	= JSON.parse(spawn("/usr/intel/bin/curl",["-s","--ntlm","-u",username+":"+password,'letsmeet.intel.com:8055/REST/Availability/GetRoomAvailabilityByBuildingLocal?organizerMailbox=zamir.ivry@intel.com&buildingName=IDC9&startTime=' + starttime + '&endTime=' + endtime + '&timeZone=Israel%20Standard%20Time&equipment=&minCapacity=0&apiKey=24D661C7-0605-4462-8A25-29B2C34653B9&requestor=undefined&format=JSON&logLevel=0']));
//		log("chain" + _.chain(result).filter(filter).pluck("ResourceName").value());
		postMessage(_.chain(result).filter(filter).pluck("ResourceName").value());	
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
		
		function findRoom(response) {
				log("finding a room");
				console.dir( response);
				if (!error && response.statusCode == 200) {
						postMessage(body.rows[0]); // Show the HTML for the Google homepage.
				}
		}
};
