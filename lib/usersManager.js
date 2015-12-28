var UsersList = {
    'U0EHK6W13': {
        name : 'Adi',
        id : 'adahan2',
        password: '',
        calendarId : 'AQMkADkzN2M4MmRiLTVlOWYtNDk2YS04NDc1LTcyYWNiMjUyYjhiMgAuAAADvvZgVHJAnkWtVNQPHGnj8wEAKKOkaMsAEkKfZA9y85QsUAA5JrpsqQAAAA=='
    },
    'U0DKSQK55': {
        name : 'Zamir',
        id : 'zivry',
        password: '',
        calendarId : 'AAMkADUwMWJmMDJjLTA4OTQtNGZjMy1iOGJhLTBjOWY0MzA0ZGZhMAAuAAAAAABC6O6LBqKfS5oVUtYELfGcAQCOjWZbQHYEQq1GCB2ElQWvAAADg7uDAAA='
    }
};

module.exports = {
    getUser: getUser
};

function getUser(userId) {
    return UsersList[userId];
}