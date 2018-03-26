"use strict";
var express = require("express");
var router = express.Router();
var account_handling = require("../src/account");
var vars_1 = require("../vars");
router.post('/login', function (req, res) {
    if (req.body.email == undefined || req.body.email.length == 0 ||
        req.body.pass == undefined || req.body.pass.length == 0)
        res.status(403).send({ error: "Empty field" });
    else
        account_handling.login(req.body.email, req.body.pass, req.session.id, vars_1.con, function (user) {
            if (!user)
                res.status(403).send({ error: "Invalid credentials" });
            else
                res.sendStatus(200);
        });
});
router.get('/login', function (req, res) {
    account_handling.isLogged(req.session.id, vars_1.con, function (user) {
        if (user)
            res.redirect('home');
        else
            res.render("login.html");
    });
});
router.get('/logout', function (req, res) {
    account_handling.logout(req.session.id, vars_1.con, function () {
        res.redirect('/');
    });
});
router.post('/register', function (req, res) {
    if (req.body.email == undefined || req.body.email.length == 0 ||
        req.body.pass == undefined || req.body.pass.length == 0)
        res.status(403).send({ error: "Empty field" });
    else
        account_handling.register(req.body.email, req.body.pass, vars_1.con, function (error) {
            if (error)
                res.status(403).send({ error: error });
            else
                account_handling.login(req.body.raddr, req.body.rpass, req.session.id, vars_1.con, function (user) {
                    res.sendStatus(200);
                });
        });
});
router.get('/register', function (req, res) {
    res.redirect('/login');
});
module.exports = router;
//# sourceMappingURL=account.js.map