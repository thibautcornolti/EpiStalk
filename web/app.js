var express = require('express');
var path = require("path");
var session = require('express-session');
var bodyParser = require('body-parser');

var vars = require('./vars.js');
var con = vars.con;

con.connect((err, con) => {
  if (err) throw err;
  console.log("Connected to " + vars.hostSQL + "!");
});

var account_route = require('./routes/account.js');
var account_handling = require('./src/account.js');
var tasks = require('./src/tasks.js');
var app = express();

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(session({
  name: 'session',
  secret: 'LdfsfhKirbfg',
  saveUninitialized: true,
  resave: true,
  keys: ['bite']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/', account_route);

app.get('/', (req, res) => {
  account_handling.isLogged(req.session.id, con, (user) => {
    if (user)
      res.redirect('home');
    else
      res.redirect('login');
  });
});

app.get('/home', (req, res) => {
  account_handling.isLogged(req.session.id, con, (user) => {
    if (user)
      res.render('home.html', user);
    else
      res.redirect('login');
  });
});

app.listen(vars.port, vars.hostname, function () {
  console.log("Mon serveur fonctionne sur http://" + vars.hostname + ":" + vars.port + "");
});

module.exports = app;
