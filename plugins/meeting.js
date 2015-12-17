var Q = require('q');
var request = require('request');
var url = require('url');

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
var password = '';
var s = "http://" + username + ":" + password + "@letsmeetrooms.intel.com/Dashboard/AllReservationDetailsPartial";
function exec(errorCodes,message, log, postMessage) {
  if(message[0] !== 'meeting')
  {
    return errorCodes.reject_notHandling;
  }
  log("request is: " + s);

  return Q.nfcall(request.get({url:s, qs:propertiesObject },findRoom));


  function findRoom(error, response, body) {
    log("finding a room");
    console.dir( body);
    if (!error && response.statusCode == 200) {
      postMessage(body.rows[0]); // Show the HTML for the Google homepage.
    }
  }
};
