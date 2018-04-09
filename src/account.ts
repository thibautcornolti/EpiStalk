import bcrypt = require('bcrypt');
import jwt = require('jsonwebtoken');
import zlib = require('zlib');
import logger = require('../logger')
import { secretToken, con } from '../vars';
import { fillDb } from './intra';

class User {
    email: string;
    city: string;
    promo: string;
    gpa: number;
    credit: number;
    current_week_log: number;
    show_rank: boolean;
    rank: any;
    show_mark: boolean;
    mark: any;

    constructor(
        email: string, city: string,
        promo: string, gpa: number,
        credit: number, current_week_log: number,
        show_rank: boolean, show_mark: boolean
    ) {
        this.email = email;
        this.city = city;
        this.promo = promo;
        this.gpa = gpa;
        this.credit = credit;
        this.current_week_log = current_week_log;
        this.show_rank = show_rank;
        this.show_mark = show_mark;
    }

    fillRank(callback: (error?: Error) => any): void {
        let queryString = "SELECT rank, show_rank FROM user WHERE email = ?";
        con.query(queryString, [this.email], (err, result_user) => {
            if (err) return callback(err);
            if (result_user.length == 0)
                return callback(Error("user not found"));
            if (!result_user[0].show_rank)
                return callback();
            zlib.inflate(result_user[0].rank, (err, res) => {
                if (err) return callback(err);
                this.rank = res.toString();
                return callback();
            });
        });
    }

    fillMark(callback: (error?: Error) => any): void {
        let queryString = "SELECT mark, show_mark FROM user WHERE email = ?";
        con.query(queryString, [this.email], (err, result_user) => {
            if (err) return callback(err);
            if (result_user.length == 0)
                return callback(Error("user not found"));
            if (!result_user[0].show_mark)
                return callback();
            zlib.inflate(result_user[0].mark, (err, res) => {
                if (err) return callback(err);
                this.mark = res.toString();
                return callback();
            });
        });
    }
}

function register(email: string, password: string, callback: (error?: Error) => any): void {
    bcrypt.hash(password, 5, (err, hashedPassword) => {
        if (err) return callback(err);
        let queryString = "SELECT email FROM user WHERE email = ?";
        con.query(queryString, [email], (err, result) => {
            if (err) return callback(err);
            if (result.length > 0)
                return callback(Error("already registered"));
            let queryString = "INSERT INTO user (email, password) VALUES (?, ?)";
            con.query(queryString, [email, hashedPassword], (err, result) => {
                if (err) return callback(err);
                return callback();
            });
        })
    });
};

function newPassword(email: string, newPassword: string, callback: (error: Error) => any): void {
    bcrypt.hash(newPassword, 5, (err, hashedPassword) => {
        if (err) return callback(err);
        let queryString = "UPDATE user SET password = ? WHERE email = ?";
        con.query(queryString, [hashedPassword, email], (err, result_user) => {
            if (err) return callback(err);
            if (result_user.length == 0)
                return callback(Error("user not found"));
            return callback(undefined);
        });
    });
}

function hasAutoLogin(email: string, callback: (error: Error, autologin?: boolean, dateCreation?) => any): void {
    let queryString = "SELECT autologin, date_autologin_failed FROM user WHERE email = ?";
    con.query(queryString, [email], (err, res) => {
        if (err) return callback(err);
        if (res.length == 0)
            return callback(Error("user not found"));
        if (!res[0].autologin || res[0].autologin == "")
            return callback(undefined, false, res[0].date_autologin_failed);
        return callback(undefined, true, res[0].date_autologin_failed);
    });
}

function setAutologinFailed(email: string) {
    logger.info("(autologin) Setting autologin failed for " + email);
    setPreferences(email, undefined, {}, (err) => {
        if (err) logger.error("(autologin) Error: " + err.message);
        else
            logger.info("(autologin) Autologin set as failed for " + email);
    });
}

function setPreferences(email: string, autologin: string, show: { [key: string]: boolean }, callback: (error?: Error) => any): void {
    let p = (val) => (val && val != "false") ? 1 : 0;
    let queryString = "UPDATE user SET autologin = ?, date_autologin_failed = " + (autologin ? "NULL" : "NOW()") + ", show_gpa = ?, show_credit = ?, show_log = ?, show_mark = ?, show_rank = ? WHERE email = ?";
    con.query(queryString, [
        autologin, p(show.gpa), p(show.credit), p(show.log),
        p(show.mark), p(show.rank), email,
    ], (err, res) => {
        if (err) return callback(err);
        if (res.length == 0)
            return callback(Error("user not found"));
        fillDb(email);
        return callback();
    });
}

function getLastChangedPreference(email: string, preferenceName: string, callback: (error: Error, lastChanged?: VarDate) => any) {
    let queryString = "SELECT " + preferenceName + " FROM user WHERE email = ?";
    con.query(queryString, [email], (err, res) => {
        if (err) return callback(err);
        if (res.length == 0)
            return callback(Error("user not found"));
        return callback(undefined, res[0][preferenceName]);
    });
}

function setPreference(email: string, preference: { [key: string]: any }, callback: (error?: Error) => any): void {
    let p = (val) => (val && val != "false") ? 1 : 0;
    let queryString = "UPDATE user SET " + preference.name + " = ?, last_changed_" + preference.name.slice(5) + " = NOW() WHERE email = ?";
    con.query(queryString, [
        p(preference.value), email,
    ], (err, res) => {
        if (err) return callback(err);
        if (res.length == 0)
            return callback(Error("user not found"));
        return callback();
    });
}

function login(email: string, password: string, expiresIn: string, callback: (error: Error, token?) => any): void {
    let queryString = "SELECT id, password FROM user WHERE email = ?";
    con.query(queryString, [email], (err, result_user) => {
        if (err) return callback(err);
        if (result_user.length == 0)
            return callback(Error("user not found"));
        bcrypt.compare(password, result_user[0].password, (err, res) => {
            if (err) return callback(err);
            if (!res)
                return callback(Error("bad password"));
            jwt.sign({ id: result_user[0].id }, secretToken, { expiresIn: expiresIn }, (err, token) => {
                if (err) return callback(err);
                return callback(undefined, token);
            });
        });
    });
};

function getUser(token: string, callback: (error: Error, user?: User) => any) {
    jwt.verify(token, secretToken, (err, data) => {
        if (err) return callback(err);
        let queryString = "SELECT email, city, promo, gpa, credit, current_week_log, show_gpa, show_credit, show_log, show_rank, show_mark FROM user WHERE id = ?";
        con.query(queryString, [data.id], (err, result_user) => {
            if (err) return callback(err);
            if (result_user.length == 0)
                return callback(Error("user not found"));
            let email = result_user[0].email;
            let city = result_user[0].city;
            let promo = result_user[0].promo;
            let gpa = (result_user[0].show_gpa) ? result_user[0].gpa : undefined;
            let credit = (result_user[0].show_credit) ? result_user[0].credit : undefined;
            let current_week_log = (result_user[0].show_log) ? result_user[0].current_week_log : undefined;
            let show_rank = result_user[0].show_rank;
            let show_mark = result_user[0].show_mark;
            return callback(undefined, new User(email, city, promo, gpa, credit, current_week_log, show_rank, show_mark));
        });
    });
};

function getUserWithEmail(email: string, callback: (error: Error, user?: User) => any) {
    let queryString = "SELECT city, promo, gpa, credit, current_week_log, show_gpa, show_credit, show_log, show_rank, show_mark FROM user WHERE email = ?";
    con.query(queryString, [email], (err, result_user) => {
        if (err) return callback(err);
        if (result_user.length == 0)
            return callback(Error("user not found"));
        let city = result_user[0].city;
        let promo = result_user[0].promo;
        let gpa = (result_user[0].show_gpa) ? result_user[0].gpa : undefined;
        let credit = (result_user[0].show_credit) ? result_user[0].credit : undefined;
        let current_week_log = (result_user[0].show_log) ? result_user[0].current_week_log : undefined;
        let show_rank = result_user[0].show_rank;
        let show_mark = result_user[0].show_mark;
        return callback(undefined, new User(email, city, promo, gpa, credit, current_week_log, show_rank, show_mark));
    });
};

function getAllUsers(token: string, callback: (error: Error, user?: Array<User>) => any) {
    getUser(token, (err, user) => {
        if (err) return callback(err);
        jwt.verify(token, secretToken, (err, data) => {
            if (err) return callback(err);
            let queryString = "SELECT email, city, promo, gpa, credit, current_week_log, show_gpa, show_credit, show_log, show_rank, show_mark FROM user";
            con.query(queryString, [data.id], (err, result_user) => {
                if (err) return callback(err);
                let users: Array<User> = [];
                for (let i = 0; i < result_user.length; ++i) {
                    let email = result_user[i].email;
                    let city = result_user[i].city;
                    let promo = result_user[i].promo;
                    let gpa = (result_user[i].show_gpa && user.gpa) ? result_user[i].gpa : undefined;
                    let credit = (result_user[i].show_credit && user.credit) ? result_user[i].credit : undefined;
                    let current_week_log = (result_user[i].show_log && user.current_week_log) ? result_user[i].current_week_log : undefined;
                    let show_rank = result_user[0].show_rank;
                    let show_mark = result_user[0].show_mark;
                    if (city || promo)
                        users.push(new User(email, city, promo, gpa, credit, current_week_log, show_rank, show_mark))
                }
                return callback(undefined, users);
            });
        });
    });
};

function clearAccounts() {
    logger.info("(clear accounts) Checking database");
    let queryString = "SELECT id, email, date_autologin_failed, autologin FROM user";
    con.query(queryString, (err, result_user) => {
        if (err) logger.error("(clear accounts) Error: " + err.message);
        else
            for (let i = 0; i < result_user.length; ++i)
                if ((!result_user[i].autologin || !result_user[i].autologin.length) &&
                    result_user[i].date_autologin_failed &&
                    new Date().getTime() - new Date(result_user[i].date_autologin_failed).getTime() > 48 * 60 * 60 * 1000) {
                    logger.info("(clear accounts) Deleting account " + result_user[i].email + " (" + result_user[i].id + ")");
                    let queryString = "DELETE FROM user WHERE id = ?";
                    con.query(queryString, [result_user[i].id], (err) => {
                        if (err) logger.error("(clear accounts) Error: " + err.message);
                        else
                            logger.info("(clear accounts) Account " + result_user[i].email + " (" + result_user[i].id + ") deleted");
                    });
                }
        logger.info("(clear accounts) Database checked");
    });
}

export {
    register, login, getUser, getUserWithEmail, getAllUsers,
    newPassword, hasAutoLogin, setPreferences, setPreference,
    getLastChangedPreference, clearAccounts, setAutologinFailed
}
