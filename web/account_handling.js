var bcrypt = require('bcrypt')
var crypto = require('crypto')

exports.register = (email, password, con, callback) => {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) throw err;
        var queryString = "SELECT email FROM user WHERE email = ?";
        con.query(queryString, [email], (err, result) => {
            if (err) throw err;
            if (result.length > 0)
                return callback("already registered");
            var queryString = "INSERT INTO user (email, password) VALUES (?, ?)";
            con.query(queryString, [email, hashedPassword], (err, result) => {
                if (err) throw err;
                return callback(undefined);
            });
        })
    });
};

exports.login = (email, password, sessionid, con, callback) => {
    var queryString = "SELECT id, password FROM user WHERE email = ?";
    con.query(queryString, [email], (err, result) => {
        if (err) throw err;
        if (result.length == 0)
            return callback(undefined);
        bcrypt.compare(password, result[0].password, (err, res) => {
            if (err) throw err;
            if (!res)
                return callback(undefined);
            var queryString = "INSERT INTO token (id_user, token) VALUES (?, ?)";
            con.query(queryString, [result[0].id, sessionid], (err, result) => {
                if (err) throw err;
                return callback({
                    token: sessionid,
                    email: email,
                });
            });
        });
    });
};

exports.logout = (sessionid, con, callback) => {
    var queryString = "DELETE FROM token WHERE token = ?";
    con.query(queryString, [sessionid], (err, result) => {
        if (err) throw err;
        return callback(undefined);
    });
};

exports.isLogged = (sessionid, con, callback) => {
    var queryString = "SELECT id_user, valid_date FROM token WHERE token = ?";
    con.query(queryString, [sessionid], (err, result) => {
        if (err) throw err;
        if (result.length == 0)
            return callback(undefined);
        var queryString = "SELECT email FROM user WHERE id = ?";
        con.query(queryString, [result[0].id_user], (err, result) => {
            if (err) throw err;
            if (result.length == 0)
                return callback(undefined);
            return callback({
                token: sessionid,
                email: result[0].email,
            });
        });
    });
};
