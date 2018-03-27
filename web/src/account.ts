import bcrypt = require('bcrypt')
import jwt = require('jsonwebtoken')
import { secretToken } from '../vars'

class User {
    db: any;
    email: string;
    gpa: number;
    credit: number;
    current_week_log: number;

    constructor(db, email: string, gpa: number, credit: number, current_week_log: number) {
        this.db = db;
        this.email = email;
        this.gpa = gpa;
        this.credit = credit;
        this.current_week_log = current_week_log;
    }

    update(callback: (error?: Error) => any): void {
        let queryString = "SELECT gpa, credit, current_week_log, show_gpa, show_credit, show_log FROM user WHERE email = ?";
        this.db.query(queryString, [this.email], (err, res) => {
            if (err) return callback(err);
            console.log(err);
            console.log(res);
            if (res.length > 0)
                return callback(Error("user not found"));
            this.gpa = (res[0].show_gpa) ? res[0].gpa : undefined;
            this.credit = (res[0].show_credit) ? res[0].credit : undefined;
            this.current_week_log = (res[0].show_log) ? res[0].current_week_log : undefined;
        });
    }
}

function register(email: string, password: string, con, callback: (error?: Error) => any): void {
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

function login(email: string, password: string, expiresIn: string, con, callback: (error: Error, token?) => any): void {
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

function getUser(token: string, con, callback: (error: Error, user?: User) => any) {
    jwt.verify(token, secretToken, (err, data) => {
        if (err) return callback(err);
        let queryString = "SELECT email, gpa, credit, current_week_log, show_gpa, show_credit, show_log FROM user WHERE id = ?";
        con.query(queryString, [data.id], (err, result_user) => {
            if (err) return callback(err);
            if (result_user.length == 0)
                return callback(Error("user not found"));
            let email = result_user[0].email;
            let gpa = (result_user[0].show_gpa) ? result_user[0].gpa : undefined;
            let credit = (result_user[0].show_credit) ? result_user[0].credit : undefined;
            let current_week_log = (result_user[0].show_log) ? result_user[0].current_week_log : undefined;
            return callback(undefined, new User(con, email, gpa, credit, current_week_log));
        });
    });
};

export { register, login, getUser }
