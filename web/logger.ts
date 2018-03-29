import winston = require('winston');
import fs = require('fs');

// Create the log directory if it does not exist
if (!fs.existsSync("log")) {
    fs.mkdirSync("log");
}

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            timestamp: () => (new Date()).toLocaleString(),
        }),
        new (require('winston-daily-rotate-file'))({
            filename: `log/epistalk-%DATE%.log`,
            timestamp: true,
            json: true,
            datePattern: 'YYYY-MM-DD',
            prepend: true,
            level: 'verbose',
          })
    ]
});

export = logger;
