"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
var hostname = 'localhost';
exports.hostname = hostname;
var hostSQL = "104.155.43.170";
exports.hostSQL = hostSQL;
var port = 3000;
exports.port = port;
var con = mysql.createConnection({
    host: hostSQL,
    user: "thibaut",
    password: "thibaut123",
    database: "epislack-test"
});
exports.con = con;
//# sourceMappingURL=vars.js.map