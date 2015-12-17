var Slack = require('slack-node');
var processMessages = require('./lib/process');
var apiToken = process.env.api_key;


var lastTimestamp = require('./lib/lastTimestamp');

console.info('Slack API Key: ' + apiToken);
var bot_channel_id = 'C0GPN3KV2';

var slack = new Slack(apiToken);


setInterval(readMessages, 1000 * 10);
// readMessages();

function readMessages() {
    console.info('Reading messages');
    slack.api('channels.history', {
        channel : bot_channel_id,
        oldest : lastTimestamp.get(),
        count: 1000
    }, processMessages);
}
