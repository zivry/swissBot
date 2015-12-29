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
		return "room [buliding]";
}
var username = 'zivry';
var password = '';
function exec(errorCodes,message, log, postMessage) {
		if(message[0] !== 'room'  )
		{
		 return errorCodes.reject_notHandling;
		}
		var building = message.length >  1 ? message[1] : 'IDC9'

		log("will find a room in building:" + building);
		var now = (new Date().getTime())+65*60*1000*2;
		var starttime = moment().add(-10,'hours').format().split("+")[0];
		var endtime = moment().add(10,'hours').format().split("+")[0];

		var result	= JSON.parse(spawn("/usr/intel/bin/curl",["-s","--ntlm","-u",username+":"+password,'letsmeet.intel.com:8055/REST/Availability/GetRoomAvailabilityByBuildingLocal?organizerMailbox=zamir.ivry@intel.com&buildingName='+ building+ '&startTime=' + starttime + '&endTime=' + endtime + '&timeZone=Israel%20Standard%20Time&equipment=&minCapacity=0&apiKey=24D661C7-0605-4462-8A25-29B2C34653B9&requestor=undefined&format=JSON&logLevel=0']));
		postMessage("found the following rooms:" + _.chain(result).filter(filter).pluck("ResourceName").value());	
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
};
