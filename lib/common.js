var request = require('sync-request');

module.exports = {
    getHttpJSON : getHttpJSON,
    postHttpJSON : postHttpJSON,
    greeting : greeting
};

function getHttpJSON(url) {
    var response = request('GET', url);
    var body = JSON.parse(response.getBody('utf8'));
    if (response.statusCode > 299) {
        console.log('HTTP ERROR ' + response.statusCode + ': %j', body)
    }
    return body;
}

function postHttpJSON(url) {
    try {
        var response = request('POST', url);
        var body = JSON.parse(response.getBody('utf8'));
        if (response.statusCode > 299) {
            console.log('HTTP ERROR ' + response.statusCode + ': %j', body)
            return undefined;
        }
        return body;
    }
    catch(err) {
        console.log('HTTP post error: ' + err);
        return undefined;
    }
}

function greeting() {
    var now = new Date();
    if(now.getHours() < 12) {
        return 'Good Morning ';
    }
    if(now.getHours() < 16) {
        return 'Good Afternoon ';
    }
    return "Good Night ";
}