"use strict";
var express = require("express");
var path = require("path");
var session = require("express-session");
var bodyParser = require("body-parser");
var vars_1 = require("./vars");
vars_1.con.connect(function (err, con) {
    if (err)
        throw err;
    console.log("Connected to " + vars_1.hostSQL + "!");
});
var account_route = require("./routes/account");
var account_handling = require("./src/account");
var app = express();
var ejs = require("ejs");
app.set('views', __dirname + '/views');
app.engine('html', ejs.renderFile);
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
app.get('/', function (req, res) {
    account_handling.isLogged(req.session.id, vars_1.con, function (user) {
        if (user)
            res.redirect('home');
        else
            res.redirect('login');
    });
});
<<<<<<< Updated upstream

app.get('/home', (req, res) => {
    account_handling.isLogged(req.session.id, con, (user) => {
    if (user)
      res.render('home.html', user);
    else
      res.redirect('login');
  });
=======
app.get('/home', function (req, res) {
    account_handling.isLogged(req.session.id, vars_1.con, function (user) {
        if (user)
            res.render('home.html', user);
        else
            res.redirect('login');
    });
>>>>>>> Stashed changes
});
app.listen(vars_1.port, vars_1.hostname, function () {
    console.log("Mon serveur fonctionne sur http://" + vars_1.hostname + ":" + vars_1.port + "");
});
module.exports = app;
//# sourceMappingURL=app.js.map