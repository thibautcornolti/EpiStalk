var mysql = require('mysql');

exports.hostname = 'localhost';
exports.hostSQL = "104.155.43.170"
exports.port = 3000;

exports.con = mysql.createConnection({
    host: exports.hostSQL,
    user: "thibaut",
    password: "thibaut123",
    database: "epislack-test"
});
