import express = require('express');
import cookieParser = require('cookie-parser')
import path = require('path');
import session = require('express-session');
import bodyParser = require('body-parser');

import { con, hostSQL, hostname, port, secretCookie } from './vars';
import { withLogin } from './src/account';

con.connect((err, con) => {
  if (err) throw err;
  console.log("Connected to " + hostSQL + "!");
});

import account_route = require('./routes/account');
import tasks = require('./src/tasks');
var app = express();

import ejs = require('ejs')

declare var __dirname

app.set('views', __dirname + '/views');
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(secretCookie))


app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/', account_route);

app.get('/', (req, res) => {
  res.redirect('home');
});

app.get('/home', withLogin, (req, res) => {
  res.render('home');
});

app.get('/settings', withLogin, (req, res) => {
        res.render('settings.html');
});

app.listen(port, hostname, function () {
  console.log("Mon serveur fonctionne sur http://" + hostname + ":" + port + "");
});

export = app;
