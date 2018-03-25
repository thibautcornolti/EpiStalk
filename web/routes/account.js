var express = require('express');
var router = express.Router();
var account_handling = require('../src/account.js');
var vars = require('../vars.js');

var con = vars.con;

router.post('/login', (req, res) => {
    if (req.body.email == undefined || req.body.email.length == 0 ||
        req.body.pass == undefined || req.body.pass.length == 0)
        res.status(403).send({ error: "Empty field" });
    else
        account_handling.login(req.body.email, req.body.pass, req.session.id, con, (user) => {
            if (!user)
                res.status(403).send({ error: "Invalid credentials" });
            else
                res.sendStatus(200);
        });
});

router.get('/login', (req, res) => {
    account_handling.isLogged(req.session.id, con, (user) => {
        if (user)
            res.redirect('home');
        else
            res.render("login.html", { failed: 0 });
    });
});

router.get('/logout', (req, res) => {
    account_handling.logout(req.session.id, con, () => {
        res.redirect('/');
    });
});

router.post('/register', (req, res) => {
    if (req.body.email == undefined || req.body.email.length == 0 ||
        req.body.pass == undefined || req.body.pass.length == 0)
        res.status(403).send({ error: "Empty field" });
    else
        account_handling.register(req.body.email, req.body.pass, con, (error) => {
            if (error)
                res.status(403).send({ error: error });
            else
                account_handling.login(req.body.raddr, req.body.rpass, req.session.id, con, (user) => {
                    res.sendStatus(200);
                });
        });
});

router.get('/register', (req, res) => {
    res.redirect('/login');
})

module.exports = router;
