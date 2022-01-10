const { createLogger, format, transports } = require('winston');
const moment = require('moment');
const DailyRotateFile = require('winston-daily-rotate-file');

const { HOSTNAME, LOG_LEVEL = 'info' } = process.env;
const { combine, timestamp, printf, label } = format;

const myFormat = printf((payload) => {
    const { level, message } = payload;
    const { label: logLabel, timestamp: logTimestamp } = payload;
    return `[${moment(logTimestamp).format('YYYY-DD-MM, HH:mm:ss:SSSSS')}] - [${logLabel}] - ${level}: ${message}`;
});


const transport = new DailyRotateFile({
    filename: `./logs/ms-voucher_%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

const logger = (callingModule = '') => createLogger({
    level: LOG_LEVEL,
    transports: [
        transport,
        new transports.Console({
            format: combine(
                label({ label: callingModule }), timestamp(), format.splat(), format.simple(), myFormat,
            ),
        })
    ],
    exceptionHandlers: [
        new transports.File({ filename: 'exceptions.log' }),
    ],
    exitOnError: false,
    timestamp: true,
    format: combine(
        label({ label: callingModule }), timestamp(), format.splat(), format.simple(), myFormat,
    ),
});

module.exports = logger;
