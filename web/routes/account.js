var express = require('express');
var router = express.Router();
var account_handling = require('../account_handling.js');
var vars = require('../vars.js');

var con = vars.con;

router.post('/login', (req, res) => {
    account_handling.login(req.body.luser, req.body.lpass, req.session.id, con, (user) => {
        if (user)
            res.redirect("/home");
        else
            res.render('loginFailed.html');
    });
});

router.get('/login', (req, res) => {
    account_handling.isLogged(req.session.id, con, (user) => {
        if (user)
            res.redirect('home');
        else
            res.render("login.html");
    });
});

router.get('/logout', (req, res) => {
    account_handling.logout(req.session.id, con, () => {
        res.redirect('/');
    });
});

router.post('/register', (req, res) => {
    account_handling.register(req.body.raddr, req.body.rpass, con, (error) => {
        if (error)
            res.send(error);
        else
            account_handling.login(req.body.raddr, req.body.rpass, req.session.id, con, (user) => {
                res.redirect("/home");
            });
    });
});

router.get('/register', (req, res) => {
    res.redirect('/login');
})

module.exports = router;
