"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bcrypt = require("bcrypt");
var User = /** @class */ (function () {
    function User(token, email) {
        this.token = token;
        this.email = email;
    }
    return User;
}());
function register(email, password, con, callback) {
    bcrypt.hash(password, 5, function (err, hashedPassword) {
        if (err)
            throw err;
        var queryString = "SELECT email FROM user WHERE email = ?";
        con.query(queryString, [email], function (err, result) {
            if (err)
                throw err;
            if (result.length > 0)
<<<<<<< Updated upstream
                return callback("Already registered");
=======
                return callback(Error("already registered"));
>>>>>>> Stashed changes
            var queryString = "INSERT INTO user (email, password) VALUES (?, ?)";
            con.query(queryString, [email, hashedPassword], function (err, result) {
                if (err)
                    throw err;
                return callback();
            });
        });
    });
}
exports.register = register;
;
function login(email, password, sessionid, con, callback) {
    var queryString = "SELECT id, password FROM user WHERE email = ?";
    con.query(queryString, [email], function (err, result) {
        if (err)
            throw err;
        if (result.length == 0)
            return callback(Error("user not found"));
        bcrypt.compare(password, result[0].password, function (err, res) {
            if (err)
                throw err;
            if (!res)
                return callback(Error("bad password"));
            var queryString = "INSERT INTO token (id_user, token) VALUES (?, ?)";
            con.query(queryString, [result[0].id, sessionid], function (err, result) {
                if (err)
                    throw err;
                return callback(new User(sessionid, email));
            });
        });
    });
}
exports.login = login;
;
function logout(sessionid, con, callback) {
    var queryString = "DELETE FROM token WHERE token = ?";
    con.query(queryString, [sessionid], function (err, result) {
        if (err)
            throw err;
        return callback();
    });
}
exports.logout = logout;
;
function isLogged(sessionid, con, callback) {
    var queryString = "SELECT id_user, valid_date FROM token WHERE token = ?";
    con.query(queryString, [sessionid], function (err, result) {
        if (err)
            throw err;
        if (result.length == 0)
            return callback(Error("token not found"));
        var queryString = "SELECT email FROM user WHERE id = ?";
        con.query(queryString, [result[0].id_user], function (err, result) {
            if (err)
                throw err;
            if (result.length == 0)
                return callback(undefined);
            return callback(new User(sessionid, result[0]["email"]));
        });
    });
}
exports.isLogged = isLogged;
;
//# sourceMappingURL=account.js.map