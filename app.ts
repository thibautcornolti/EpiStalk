import express = require('express');
import favicon = require('serve-favicon')
import cookieParser = require('cookie-parser')
import path = require('path');
import session = require('express-session');
import bodyParser = require('body-parser');
import ejs = require('ejs');
import tcpPortUsed = require('tcp-port-used');


import { setMaster, con, hostSQL, hostname, port, secretCookie, createConnection, isMaster } from './vars';

function handleDisconnect() {
    createConnection();

    con.connect((err, con) => {
        if (err) {
            logger.error("(sql) " + err.message);
            setTimeout(handleDisconnect, 2000);
        }
        else logger.info("(sql) Successfully connected to " + hostSQL + "!");
    });

    con.on('error', function (err) {
        logger.error("(sql) " + err.message);
        if (err.code === 'PROTOCOL_CONNECTION_LOST')
            handleDisconnect();
        else
            throw err;
    });
}

handleDisconnect();


import { withLogin, withLog } from './src/middleware';
import api_route = require('./routes/api');
import render_route = require('./routes/render');
import tasks = require('./src/tasks');
import logger = require('./logger');

tasks();
var app = express();

declare var __dirname

app.set('views', __dirname + '/views');
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(secretCookie));
app.use(withLog);

app.use(favicon(path.join(__dirname, '/public/images/favicon.ico')));
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/', api_route);
app.use('/', render_route);

async function startServer(offset = 0) {
    tcpPortUsed.check(port + offset, hostname).then((inUse) => {
        if (inUse)
            startServer(offset + 1);
        else {
            app.listen(port + offset, hostname, function () {
                if (offset == 0) {
                    setMaster();
                    logger.info("(master) Server is master!")
                }
                logger.info("(http) Server launched on http://" + hostname + ":" + (port + offset) + "");
            });
        }
    });
}

startServer();

export = app;
