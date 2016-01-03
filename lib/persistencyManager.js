var constants = require('./constants');
var fs = require('fs');

var persistencyObject = {};

module.exports = {
    init : init,
    storeInPersistency : storeInPersistency,
    readFromPersistency : readFromPersistency
};

function init() {
    if (fs.existsSync('./' + constants.PERSISTENCY_FILENAME)) {
        persistencyObject = JSON.parse(fs.readFileSync('./' + constants.PERSISTENCY_FILENAME).toString().trim());
        console.info('Persistency file was read');
    }
}

function storeInPersistency(ObjectName, pluginPersistencyObject) {
    if(process.env.SKIP_TIMESTAMP_UPDATE === undefined) {
        console.log('Storing data \'' + ObjectName + '\' in persistency');
        persistencyObject[ObjectName] = pluginPersistencyObject;
        fs.writeFileSync('./' + constants.PERSISTENCY_FILENAME, JSON.stringify(persistencyObject));
        return;
    }
    console.log('Skipping persistency store from ' + ObjectName + ' due to environment variable');
}

function readFromPersistency(ObjectName) {
    return (persistencyObject[ObjectName]) ? persistencyObject[ObjectName] : {};
}