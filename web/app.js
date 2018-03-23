var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var mysql = require('mysql');
var passwordHash = require('password-hash')

// Nous définissons ici les paramètres du serveur.
var hostname = 'localhost';
var hostSQL = "104.155.43.170"
var port = 3000;
var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: true });

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
  con.query("SELECT email FROM user", function (err, result, fields) {
    if (err) throw err;
    Object.keys(result).forEach(function (key) {
      var row = result[key];
    });
  });
  res.sendFile(path.join(__dirname + '/views/login.html'));
});

app.get('/register', function (req, res) {
  res.sendFile(path.join(__dirname + '/about.html'));
});

app.post('/login', urlencodedParser, function (req, res) {
  var reply = '';
  reply += "Your name is " + req.body.luser + "\n";
  reply += "Your password id is " + req.body.lpass + "\n";
  con.query("SELECT email FROM user WHERE email='" + req.body.luser + "'", function (err, result, fields) {
    if (err) throw err;
    if (result == "") res.sendFile(path.join(__dirname + '/views/login.html'));
    else res.send(reply);
  });
});

app.post('/register', urlencodedParser, function (req, res) {
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