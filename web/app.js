var express = require('express');
var path = require("path");
var session = require('express-session');
var bodyParser = require('body-parser');
var account_route = require('./routes/account.js');
var account_handling = require('./account_handling.js');
var vars = require('./vars.js');
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

var con = vars.con;

con.connect((err, con) => {
  if (err) throw err;
  console.log("Connected to " + vars.hostSQL + "!");
});

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

app.get('/admin', (req, res) => {
  sess = req.session;
  if (sess.email) {
    res.write('<h1>Bonjour ' + sess.keys + " " + sess.bite + '</h1><br>');
    res.end('<a href=' + '/logout' + '>Se déconnecter</a>');
  }
  else {
    res.write('<h1>Erreur vous devez etre connecter.</h1>');
    res.end('<a href=' + '/' + '>Se connecter</a>');
  }

});

app.listen(vars.port, vars.hostname, function () {
  console.log("Mon serveur fonctionne sur http://" + vars.hostname + ":" + vars.port + "");
});

module.exports = app;
