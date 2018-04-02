import express = require('express');
import Promise = require('promise');
var router = express.Router();
import { withLog, withLogin, withAPILogin } from '../src/middleware';
import {
    login, register, getUser, getAllUsers, getUserWithEmail,
    newPassword, hasAutoLogin, setPreferences,
} from '../src/account';
import { getLoginWithAutologin, fillDb } from '../src/intra'
import { con, disableRegistrations } from '../vars';
import { error } from 'util';

router.post('/api/login', (req, res) => {
    if (req.body.email == undefined || req.body.email.length == 0 ||
        req.body.pass == undefined || req.body.pass.length == 0)
        res.status(403).send({ warning: "Empty field" });
    else
        login(req.body.email, req.body.pass, "2w", (error, token) => {
            if (error)
                res.status(403).send({ error: "Invalid credentials" });
            else
                res.status(200).send({ token: token });
        });
});

router.get('/api/user', withAPILogin, (req, res) => {
    if (!req.query.login)
        res.status(200).send({ user: req.user });
    else
        getUserWithEmail(req.query.login, (err, user) => {
            if (err) {
                res.status(403).send({ error: "Login not found" });
                return;
            }
            user.gpa = (req.user.gpa) ? user.gpa : undefined;
            user.credit = (req.user.credit) ? user.credit : undefined;
            user.current_week_log = (req.user.current_week_log) ? user.current_week_log : undefined;
            let fillRank = new Promise((resolve, reject) => {
                if (!req.user.show_rank)
                    return resolve();
                user.fillRank((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            let fillMark = new Promise((resolve, reject) => {
                if (!req.user.show_mark)
                    return resolve();
                user.fillMark((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            Promise.all([fillRank, fillMark]).then(() => {
                res.status(200).send({ user });
            });
        });
});

router.get('/api/users', withAPILogin, (req, res) => {
    let token = req.cookies.token
    if (!token)
        res.status(403).send({ error: "Token not found" });
    getAllUsers(token, (err, users) => {
        if (err)
            res.status(403).send({ error: "Invalid credentials" });
        else {
            res.status(200).send({ users: users });
        }
    });
});

router.get('/login', (req, res) => {
    let token = req.cookies.token
    if (!token)
        res.render('login');
    else {
        getUser(token, (err, user) => {
            if (err)
                res.render('login');
            else
                res.redirect('home');
        });
    }
});

router.get('/logout', (req, res) => {
    res.setHeader("Set-Cookie", "token=;expires=Thu, 01 Jan 1970 00:00:01 GMT");
    res.redirect('/');
});

router.post('/api/register', (req, res) => {
    if (req.body.email == undefined || req.body.email.length == 0 ||
        req.body.pass == undefined || req.body.pass.length == 0) {
        res.status(403).send({ warning: "Empty field" });
        return;
    }
    let reg = req.body.email.match(/[a-z]+\.[a-z]+@epitech.eu/i)
    if (!reg || reg[0] != req.body.email)
        res.status(403).send({ warning: "Invalid email" });
    else if (disableRegistrations)
        res.status(403).send({ error: "Registrations are disabled!" });
    else
        register(req.body.email, req.body.pass, (error?) => {
            if (error)
                res.status(403).send({ error: "You already have an account. Please login." });
            else
                res.status(200).send({ message: "You have been registered. Please login." });;
        });
});

router.post('/api/password', withAPILogin, (req, res) => {
    newPassword(req.user.email, req.body.passwordConfirm, (error?) => {
        if (error)
            res.status(403).send({ error: "An error was occured. Please try again." });
        else
            res.status(200).send({ message: "You successfully changed your password." });;
    });
});

router.get('/api/autologin', withAPILogin, (req, res) => {
    hasAutoLogin(req.user.email, (error, has) => {
        if (error)
            res.status(403).send({ error: "An error was occured. Please try again." });
        else
            res.status(200).send({ autologin: has });
    });
});

router.post('/api/preferences', withAPILogin, (req, res) => {
    let show = {
        gpa: req.body.show_gpa,
        credit: req.body.show_credit,
        log: req.body.show_log,
        mark: req.body.show_mark,
        rank: req.body.show_rank,
    }
    if (!req.body.autologin)
        return res.status(403).send({ error: "Wrong autologin." });
    let reg = req.body.autologin.match(/https:\/\/intra.epitech.eu\/auth-/i);
    if (!reg || reg.index)
        res.status(403).send({ error: "Wrong autologin." });
    else
        getLoginWithAutologin(req.body.autologin, (error, login) => {
            if (login != req.user.email)
                res.status(403).send({ error: "This autologin is not yours!" });
            else
                setPreferences(req.user.email, req.body.autologin, show, (error?) => {
                    if (error)
                        res.status(403).send({ error: "An error was occured. Please try again." });
                    else
                        res.status(200).send({ message: "You successfully saved your preferences!" });
                });
        });
});

router.get('/register', (req, res) => {
    res.redirect('/login');
})

export = router;
