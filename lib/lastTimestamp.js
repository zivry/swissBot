var fs = require('fs');
var lastTimestamp = undefined;
var persistenceFileName = 'persistence.txt';

module.exports = {
    get : get,
    update : update
};

function get() {
    if (lastTimestamp) {
        return lastTimestamp;
    }
    if (fs.existsSync('./' + persistenceFileName)) {
        lastTimestamp = fs.readFileSync('./' + persistenceFileName);
        console.info('Reading lastTimestamp from disk: ' + lastTimestamp);
        return lastTimestamp;
    }
    return 0;
}

function update(timestamp) {
    console.log('Updating last time stamp: ' + timestamp);
    lastTimestamp = timestamp;
	if(process.env.SKIP_TIMESTAMP_UPDATE !== undefined)
		return;
    fs.writeFileSync('./' + persistenceFileName, lastTimestamp);
}
