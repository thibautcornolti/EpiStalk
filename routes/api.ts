import express = require('express');
var router = express.Router();
import { withAPILogin } from '../src/middleware';
import {
    login, register, getUser, getAllUsers, getUserWithEmail,
    newPassword, hasAutoLogin, setPreferences, setPreference,
    getLastChangedPreference,
} from '../src/account';
import { getLoginWithAutologin, fillDb } from '../src/intra'
import { con, disableRegistrations } from '../vars';

router.post('/api/login', async (req, res) => {
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

router.get('/api/user', withAPILogin, async (req, res) => {
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

router.get('/api/users', withAPILogin, async (req, res) => {
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

router.post('/api/register', async (req, res) => {
    if (req.body.email == undefined || req.body.email.length == 0 ||
        req.body.pass == undefined || req.body.pass.length == 0) {
        res.status(403).send({ warning: "Empty field" });
        return;
    }
    let reg = req.body.email.match(/[a-z-]*[0-9]*\.[a-z-]*@epitech.eu/i)
    if (!reg || reg[0] != req.body.email)
        res.status(403).send({ warning: "Invalid epitech email" });
    else if (disableRegistrations)
        res.status(403).send({ error: "Registrations are disabled!" });
    else
        register(req.body.email.toLowerCase(), req.body.pass, (error?) => {
            if (error)
                res.status(403).send({ error: "You already have an account. Please login." });
            else
                res.status(200).send({ message: "You have been registered. Please login." });;
        });
});

router.post('/api/password', withAPILogin, async (req, res) => {
    newPassword(req.user.email, req.body.passwordConfirm, (error?) => {
        if (error)
            res.status(403).send({ error: "An error was occured. Please try again." });
        else
            res.status(200).send({ message: "You successfully changed your password." });;
    });
});

router.get('/api/autologin', withAPILogin, async (req, res) => {
    hasAutoLogin(req.user.email, (error, has, dateAutologinFailed) => {
        if (error)
            res.status(403).send({ error: "An error was occured. Please try again." });
        else
            res.status(200).send({ autologin: has, failed: dateAutologinFailed });
    });
});

router.post('/api/preferences', withAPILogin, async (req, res) => {
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

router.post('/api/preference', withAPILogin, async (req, res) => {
    if (!req.body.name || !req.body.value)
        return res.status(403).send({ error: "An error was occured. Please try again." });
    let reg = req.body.name.match(/show_(gpa|credit|log|mark|rank)/i);
    if (!reg || reg.index)
        return res.status(403).send({ error: "An error was occured. Please try again." });
    getLastChangedPreference(req.user.email, "last_changed_" + req.body.name.slice(5), (error, date?) => {
        if (new Date().getTime() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000 && req.body.value == "false")
            res.status(403).send({ error: "You already changed your preferences in the last 7 days!" });
        else
            setPreference(req.user.email, { name: req.body.name, value: req.body.value }, (error?) => {
                if (error)
                    res.status(403).send({ error: "An error was occured. Please try again." });
                else
                    res.status(200).send({ message: "You successfully saved your preferences!" });
            });
    });
});

export = router;
