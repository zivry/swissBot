module.exports = {
    getUser: getUser,
    getNegotiator: getNegotiator
};

function getUser(userId) {
    return UsersList[userId];
}

function getNegotiator() {
    return {
        username : 'sys_nbflow',
        password : ''//DONT COMMIT THIS LINE!
    }
}

////////////////////////
// Users List

var UsersList = {
    'U0EHK6W13': {
        name : 'Adi',
        id : 'adahan2',
        calendarId : 'AQMkADkzN2M4MmRiLTVlOWYtNDk2YS04NDc1LTcyYWNiMjUyYjhiMgAuAAADvvZgVHJAnkWtVNQPHGnj8wEAKKOkaMsAEkKfZA9y85QsUAA5JrpsqQAAAA=='
    },
    'U0DKSQK55': {
        name : 'Zamir',
        id : 'zivry',
        calendarId : 'AAMkADUwMWJmMDJjLTA4OTQtNGZjMy1iOGJhLTBjOWY0MzA0ZGZhMAAuAAAAAABC6O6LBqKfS5oVUtYELfGcAQCOjWZbQHYEQq1GCB2ElQWvAAADg7uDAAA='
    },
    'U0EHF3LE9': {
        name : 'Alex',
        id : 'abarapp',
        calendarId : ''
    },
    'U0EHKARF0': {
        name : 'Eyal',
        id : 'egruber',
        calendarId : ''
    },
    'U0EEHLEG2': {
        name : 'Roi',
        id : 'rezra3',
        calendarId : ''
    },
    'U0GQ314BY': {
        name : 'Itamar',
        id : 'ibinyami',
        calendarId : ''
    },
    'U0EJNSWR3': {
        name : 'Itzik',
        id : '',
        calendarId : ''
    },
    'U0EH4UFHR': {
        name : 'Liel',
        id : 'lchayoun',
        calendarId : ''
    },
    'U0EHL98US': {
        name : 'Noam',
        id : 'nambar',
        calendarId : ''
    },
    'U0EHJGQE8': {
        name : 'Regev',
        id : 'rbrody',
        calendarId : ''
    },
    'U0EHL1Y7K': {
        name : 'Vladimir',
        id : 'vgroisma',
        calendarId : ''
    }
};