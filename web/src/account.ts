import bcrypt = require('bcrypt')
import jwt = require('jsonwebtoken')
import { secretToken, con } from '../vars'
import { fillDb } from './intra';

class User {
    email: string;
    city: string;
    promo: string;
    gpa: number;
    credit: number;
    current_week_log: number;

    constructor(email: string, city: string, promo: string, gpa: number, credit: number, current_week_log: number) {
        this.email = email;
        this.city = city;
        this.promo = promo;
        this.gpa = gpa;
        this.credit = credit;
        this.current_week_log = current_week_log;
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
                fillDb(email);
                return callback();
            });
        })
    });
};

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
        let queryString = "SELECT email, city, promo, gpa, credit, current_week_log, show_gpa, show_credit, show_log FROM user WHERE id = ?";
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
            return callback(undefined, new User(email, city, promo, gpa, credit, current_week_log));
        });
    });
};

function getUserWithEmail(email: string, callback: (error: Error, user?: User) => any) {
    let queryString = "SELECT city, promo, gpa, credit, current_week_log, show_gpa, show_credit, show_log FROM user WHERE email = ?";
    con.query(queryString, [email], (err, result_user) => {
        if (err) return callback(err);
        if (result_user.length == 0)
            return callback(Error("user not found"));
        let city = result_user[0].city;
        let promo = result_user[0].promo;
        let gpa = (result_user[0].show_gpa) ? result_user[0].gpa : undefined;
        let credit = (result_user[0].show_credit) ? result_user[0].credit : undefined;
        let current_week_log = (result_user[0].show_log) ? result_user[0].current_week_log : undefined;
        return callback(undefined, new User(email, city, promo, gpa, credit, current_week_log));
    });
};

function getAllUsers(token: string, callback: (error: Error, user?: Array<User>) => any) {
    getUser(token, (err, user) => {
        if (err) return callback(err);
        jwt.verify(token, secretToken, (err, data) => {
            if (err) return callback(err);
            let queryString = "SELECT email, city, promo, gpa, credit, current_week_log, show_gpa, show_credit, show_log FROM user";
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
                    users.push(new User(email, city, promo, gpa, credit, current_week_log))
                }
                return callback(undefined, users);
            });
        });
    });
};

/* Middleware function to check token for render endpoints */
function withLogin(req, res, next) {
    let token = req.cookies.token
    if (!token)
        res.redirect('login');
    else {
        getUser(token, (err, user) => {
            if (err)
                res.redirect('login');
            else {
                req.user = user;
                next();
            }
        });
    }
}

/* Middleware function to check token for api endpoints */
function withAPILogin(req, res, next) {
    let token = req.cookies.token
    if (!token)
        res.status(403).send({ error: "Token not found" });
    else {
        getUser(token, (err, user) => {
            if (err)
                res.status(403).send({ error: "Invalid credentials" });
            else {
                req.user = user;
                next();
            }
        });
    }
}

export { withLogin, withAPILogin, register, login, getUser, getUserWithEmail, getAllUsers }
