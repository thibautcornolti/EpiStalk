"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var vars_1 = require("../vars");
var User = /** @class */ (function () {
    function User(email, gpa, credit, current_week_log) {
        this.email = email;
        this.gpa = gpa;
        this.credit = credit;
        this.current_week_log = current_week_log;
    }
    return User;
}());
function register(email, password, con, callback) {
    bcrypt.hash(password, 5, function (err, hashedPassword) {
        if (err)
            return callback(err);
        var queryString = "SELECT email FROM user WHERE email = ?";
        con.query(queryString, [email], function (err, result) {
            if (err)
                return callback(err);
            if (result.length > 0)
                return callback(Error("already registered"));
            var queryString = "INSERT INTO user (email, password) VALUES (?, ?)";
            con.query(queryString, [email, hashedPassword], function (err, result) {
                if (err)
                    return callback(err);
                return callback();
            });
        });
    });
}
exports.register = register;
;
function login(email, password, expiresIn, con, callback) {
    var queryString = "SELECT id, password FROM user WHERE email = ?";
    con.query(queryString, [email], function (err, result_user) {
        if (err)
            return callback(err);
        if (result_user.length == 0)
            return callback(Error("user not found"));
        bcrypt.compare(password, result_user[0].password, function (err, res) {
            if (err)
                return callback(err);
            if (!res)
                return callback(Error("bad password"));
            jwt.sign({ id: result_user[0].id }, vars_1.secretToken, { expiresIn: expiresIn }, function (err, token) {
                if (err)
                    return callback(err);
                return callback(undefined, token);
            });
        });
    });
}
exports.login = login;
;
function getUser(token, con, callback) {
    jwt.verify(token, vars_1.secretToken, function (err, data) {
        if (err)
            return callback(err);
        var queryString = "SELECT email, gpa, credit, current_week_log, show_gpa, show_credit, show_log FROM user WHERE id = ?";
        con.query(queryString, [data.id], function (err, result_user) {
            if (err)
                return callback(err);
            if (result_user.length == 0)
                return callback(Error("user not found"));
            var email = result_user[0].email;
            var gpa = (result_user[0].show_gpa) ? result_user[0].gpa : undefined;
            var credit = (result_user[0].show_credit) ? result_user[0].credit : undefined;
            var current_week_log = (result_user[0].show_log) ? result_user[0].current_week_log : undefined;
            return callback(undefined, new User(email, gpa, credit, current_week_log));
        });
    });
}
exports.getUser = getUser;
;
function getAllUsers(token, con, callback) {
    getUser(token, con, function (err, user) {
        if (err)
            return callback(err);
        jwt.verify(token, vars_1.secretToken, function (err, data) {
            if (err)
                return callback(err);
            var queryString = "SELECT email, gpa, credit, current_week_log, show_gpa, show_credit, show_log FROM user";
            con.query(queryString, [data.id], function (err, result_user) {
                if (err)
                    return callback(err);
                var users = [];
                for (var i = 0; i < result_user.length; ++i) {
                    var email = result_user[i].email;
                    var gpa = (result_user[i].show_gpa && user.gpa) ? result_user[i].gpa : undefined;
                    var credit = (result_user[i].show_credit && user.credit) ? result_user[i].credit : undefined;
                    var current_week_log = (result_user[i].show_log && user.current_week_log) ? result_user[i].current_week_log : undefined;
                    users.push(new User(email, gpa, credit, current_week_log));
                }
                return callback(undefined, users);
            });
        });
    });
}
exports.getAllUsers = getAllUsers;
;
//# sourceMappingURL=account.js.map