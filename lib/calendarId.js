var exchanger = require('exchanger');

var options = {
    username: '',
    password: '',
    url: 'webmail.intel.com'
};


exchanger.initialize(options, function(connection) {
    console.log('Initialized!');
    exchanger.getAllFolders(function(err, reponse){
        console.log(err);
        console.log(reponse);
    });
});