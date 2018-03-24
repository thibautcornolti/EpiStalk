var express = require('express');
var path = require("path");
var session = require('express-session');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var passwordHash = require('password-hash')
// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost';
var hostSQL = "104.155.43.170"
var port = 3000;
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

var sess;

var con = mysql.createConnection({
  host: hostSQL,
  user: "thibaut",
  password: "thibaut123",
  database: "epislack-test"
});

con.connect(function (err, con) {
  if (err) throw err;
  console.log("Connected to " + hostSQL + "!");
});

app.use('/public', express.static(path.join(__dirname, '/public')));

app.get('/', function (req, res) {
  sess = req.session;
  if (sess.email)
    res.redirect('/home');
  else
    res.render('login.html');
});

app.get('/register', function (req, res) {
  res.sendFile(path.join(__dirname + '/about.html'));
});

app.get('/home', function (req, res) {
  if (sess.email) {
    var sessionid = req.session.id;
    res.render('home.html', { sessionid: sessionid });
  }
  else
    res.render('login.html');
});

app.post('/login', function (req, res) {
  sess = req.session;
  sess.email = req.session.id;
  var reply = '';
  reply += "Your name is " + req.body.luser + "\n";
  reply += "Your password id is " + req.body.lpass + "\n";
  con.query("SELECT email, password FROM user WHERE email='" + req.body.luser + "'", function (err, result, fields) {
    console.log(result);
    if (err) throw err;
    var bool = (result == "") ? false : passwordHash.verify(req.body.lpass, result[0].password);
    if (result == "" || bool == false)
      res.render('loginFailed.html');
    else if (sess.email)
      res.render('home.html', {sessionid:req.session.id})
    else {
      res.write('<h1>Erreur vous devez etre connecter.</h1>');
      res.end('<a href=' + '/' + '>Se connecter</a>');
    }
  });
});

app.get('/admin', function (req, res) {
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

app.get('/logout', function (req, res) {

  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }
    else {
      res.redirect('/');
    }
  });

});

app.post('/register', function (req, res) {
  var sql = "INSERT INTO user (email, password) VALUES ('" + req.body.raddr + "', '" + passwordHash.generate(req.body.rpass) + "')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(sql);
  });
  var reply = '';
  reply += "Hi " + req.body.ruser + ", you are now register with" + req.body.raddr;
  res.send(reply);
});


app.listen(port, hostname, function () {
  console.log("Mon serveur fonctionne sur http://" + hostname + ":" + port + "");
});