import express = require('express');
import favicon = require('serve-favicon')
import cookieParser = require('cookie-parser')
import path = require('path');
import session = require('express-session');
import bodyParser = require('body-parser');
import ejs = require('ejs');

import { con, hostSQL, hostname, port, secretCookie, createConnection } from './vars';

function handleDisconnect() {
    createConnection();

    con.connect((err, con) => {
        if (err) {
            logger.error("(sql) "+err.message);
            setTimeout(handleDisconnect, 2000);
        }
        else logger.info("(sql) Successfully connected to " + hostSQL + "!");
    });

    con.on('error', function (err) {
        logger.error("(sql) "+err.message);
        if (err.code === 'PROTOCOL_CONNECTION_LOST')
            handleDisconnect();
        else
            throw err;
    });
}

handleDisconnect();


import { withLogin, withLog } from './src/middleware';
import account_route = require('./routes/account');
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
app.use('/', account_route);

app.get('/', async (req, res) => {
    res.redirect('home');
});

app.get('/home', withLogin, async (req, res) => {
    res.render('home');
});

app.get('/user', withLogin, async (req, res) => {
    res.render('user');
});

app.get('/settings', withLogin, async (req, res) => {
    res.render('settings');
});

app.listen(port, hostname, function () {
    logger.info("(http) Server launched on http://" + hostname + ":" + port + "");
});

export = app;
