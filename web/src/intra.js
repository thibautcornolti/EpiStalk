"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var https = require("https");
var zlib = require("zlib");
var vars = require("../vars");
var con = vars.con;
function getData(autologin, callback) {
    var req = https.get(autologin, function (res) {
        if (!("set-cookie" in res.headers))
            return callback(Error("could not get cookie"));
        var cookie = res.headers["set-cookie"];
        var option = {
            hostname: "intra.epitech.eu",
            path: "/user/?format=json",
            method: "GET",
            headers: {
                "cookie": cookie,
            },
        };
        var req = https.request(option, function (res) {
            var rawData;
            res.on("data", function (d) { rawData += d; });
            res.on("end", function (d) {
                var data = JSON.parse(rawData);
                var option = {
                    hostname: "intra.epitech.eu",
                    path: "/user/" + data.login + "/notes/?format=json",
                    method: "GET",
                    headers: {
                        "cookie": cookie,
                    },
                };
                var req = https.request(option, function (res) {
                    var rawData;
                    res.on("data", function (d) { rawData += d; });
                    res.on("end", function (d) {
                        zlib.deflate(new Buffer(rawData), function (err, res) {
                            if (err)
                                throw err;
                            data.mark = res;
                            return callback(data);
                        });
                    });
                });
                req.on("error", function (err) {
                    return callback(undefined);
                });
                req.end();
            });
        });
        req.on("error", function (err) {
            return callback(undefined);
        });
        req.end();
    });
    req.on("error", function (err) {
        return callback(undefined);
    });
}
function setData(id, data) {
    var queryString = "UPDATE user SET gpa = ?, mark = ?, credit = ?, current_week_log = ? WHERE id = ?";
    var gpa = 0.0;
    for (var i = 0; i < data.gpa.length; ++i) {
        if (data.gpa[i].cycle == "bachelor")
            gpa = parseFloat(data.gpa[i].gpa);
    }
    var credit = parseInt(data.credits);
    var current_week_log = parseFloat(data.nsstat.active);
    var mark = data.mark;
    con.query(queryString, [gpa, mark, credit, current_week_log, id], function (err, result) {
        if (err)
            throw err;
    });
}
function fillDb() {
    var queryString = "SELECT id, autologin FROM user";
    con.query(queryString, function (err, result) {
        if (err)
            throw err;
        result.forEach(function (row) {
            if (row.autologin)
                getData(row.autologin, function (data) {
                    setData(row.id, data);
                });
        });
    });
}
exports.fillDb = fillDb;
;
function getLoginWithAutologin(autologin, callback) {
    var req = https.get(autologin, function (res) {
        if (!("set-cookie" in res.headers))
            return callback(Error("could not get cookie"));
        var cookie = res.headers["set-cookie"];
        var option = {
            hostname: "intra.epitech.eu",
            path: "/user/?format=json",
            method: "GET",
            headers: {
                "cookie": cookie,
            },
        };
        var req = https.request(option, function (res) {
            var rawData;
            res.on("data", function (d) { rawData += d; });
            res.on("end", function (d) {
                var data = JSON.parse(rawData);
                return callback(data.login);
            });
        });
        req.on("error", function (err) {
            return callback(err);
        });
        req.end();
    });
    req.on("error", function (err) {
        return callback(err);
    });
}
exports.getLoginWithAutologin = getLoginWithAutologin;
;
//# sourceMappingURL=intra.js.map