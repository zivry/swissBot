var winston = require('winston'),
    fs = require('fs'),
    logDir = 'logs',
    env = process.env.NODE_ENV || 'development',
    logger;

winston.setLevels(winston.config.npm.levels);
winston.addColors(winston.config.npm.colors);

if (!fs.existsSync(logDir)) {
    // Create the directory if it does not exist
    fs.mkdirSync(logDir);
}
logger = new (winston.Logger)({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            colorize: true,
            prettyPrint: true,
            handleExceptions: true,
            humanReadableUnhandledException: true,
            timestamp: true
        }),
        new winston.transports.File({
            level: env === 'development' ? 'debug' : 'info',
            filename: logDir + '/rest_api.log',
            maxsize: 1024 * 1024 * 10, // 10MB,
            maxFiles: 3,
            prettyPrint: true,
            timestamp: true,
            json: false
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: logDir + '/exceptions.log',
            prettyPrint: true,
            timestamp: true,
            json: false
        })
    ],
    exitOnError: false
});

module.exports = logger;
