import express = require('express');
import cookieParser = require('cookie-parser')
import path = require('path');
import session = require('express-session');
import bodyParser = require('body-parser');
import ejs = require('ejs');

import { con, hostSQL, hostname, port, secretCookie } from './vars';

con.connect((err, con) => {
    if (err) logger.error(err.message);
    else logger.info("(sql) Successfully connected to " + hostSQL + "!");
});

import { withLogin, withLog } from './src/middleware';
import account_route = require('./routes/account');
import tasks = require('./src/tasks');
import logger = require('./logger');

var app = express();

declare var __dirname

app.set('views', __dirname + '/views');
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(secretCookie));
app.use(withLog);

app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/', account_route);

import { fillDb } from './src/intra';

app.get('/', (req, res) => {
    res.redirect('home');
});

app.get('/home', withLogin, (req, res) => {
    res.render('home');
});

app.get('/user', withLogin, (req, res) => {
    res.render('user');
});

app.get('/settings', withLogin, (req, res) => {
    res.render('settings');
});

app.listen(port, hostname, function () {
    logger.info("(http) Server launched on http://" + hostname + ":" + port + "");
});

export = app;
