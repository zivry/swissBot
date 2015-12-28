var Q = require('q');
var request = require('request');
var ntlm = require('request-ntlm');
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
var s = "https://" + username + ":" + password + "@letsmeetrooms.intel.com/Dashboard/AllReservationDetailsPartial";
function exec(errorCodes,message, log, postMessage) {
  // if(message[0] !== 'meeting')
  // {
  //   return errorCodes.reject_notHandling;
  // }
  // log("request is: " + s);

  var opts = {
    username: username,
    password: password,
    url: 'https://letsmeetrooms.intel.com/Dashboard/AllReservationDetailsPartial'
  };
  // return Q.nfcall(request.get({url:s, qs:propertiesObject },findRoom));
  // ntlm.get(opts,{},  function(err, response) {
  // console.dir("=====================inside:"   +  response);
  // });
  log("will find a room");

  return Q.nfcall(ntlm.get,opts,{}).then(findRoom).catch(function (err)
{
  console.dir(err);
});


  function findRoom(response) {
    log("finding a room");
    console.dir( response);
    if (!error && response.statusCode == 200) {
      postMessage(body.rows[0]); // Show the HTML for the Google homepage.
    }
  }
};
