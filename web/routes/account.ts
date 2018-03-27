import express = require('express');
var router = express.Router();
import account_handling = require('../src/account');
import { con } from '../vars';

router.post('/login', (req, res) => {
    if (req.body.email == undefined || req.body.email.length == 0 ||
        req.body.pass == undefined || req.body.pass.length == 0)
        res.status(403).send({ warning: "Empty field" });
    else
        account_handling.login(req.body.email, req.body.pass, "2w", con, (error, token) => {
            if (error)
                res.status(403).send({ error: "Invalid credentials" });
            else
                res.status(200).send({ token: token });
        });
});

router.get('/login', (req, res) => {
    res.render("login.html")
});

router.get('/logout', (req, res) => {
    res.setHeader("Set-Cookie", "token=;expires=Thu, 01 Jan 1970 00:00:01 GMT");
    res.redirect('/');
});

router.post('/register', (req, res) => {
    if (req.body.email == undefined || req.body.email.length == 0 ||
        req.body.pass == undefined || req.body.pass.length == 0)
        res.status(403).send({ warning: "Empty field" });
    else
        account_handling.register(req.body.email, req.body.pass, con, (error?) => {
            if (error)
                res.status(403).send({ error: "You already have an account. Please login." });
            else
                res.status(200).send({ message: "You have been registered. Please login." });;
        });
});

router.get('/register', (req, res) => {
    res.redirect('/login');
})

export = router;
