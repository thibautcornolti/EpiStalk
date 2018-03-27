import express = require('express');
import cookieParser = require('cookie-parser')
import path = require('path');
import session = require('express-session');
import bodyParser = require('body-parser');

import { con, hostSQL, hostname, port, secretCookie } from './vars';

con.connect((err, con) => {
  if (err) throw err;
  console.log("Connected to " + hostSQL + "!");
});

import account_route = require('./routes/account');
import account_handling = require('./src/account');
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

app.get('/home', (req, res) => {
  let token = req.cookies.token
  if (!token)
    res.redirect('login');
  else {
    account_handling.getUser(token, con, (err, user) => {
      if (err)
        res.redirect('login');
      else
        res.render('home.html', { user });
    });
  }
});

app.listen(port, hostname, function () {
  console.log("Mon serveur fonctionne sur http://" + hostname + ":" + port + "");
});

export = app;
