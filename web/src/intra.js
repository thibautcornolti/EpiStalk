var https = require('https');
var zlib = require('zlib');
var vars = require('../vars.js');

var con = vars.con;

function getData(autologin, callback) {
    let req = https.get(autologin, (res) => {
        if (!("set-cookie" in res.headers))
            return callback(undefined);
        let cookie = res.headers["set-cookie"];
        option = {
            hostname: "intra.epitech.eu",
            path: "/user/?format=json",
            method: "GET",
            headers: {
                "cookie": cookie,
            },
        };
        let req = https.request(option, (res) => {
            let rawData = "";
            res.on("data", (d) => { rawData += d; });
            res.on("end", (d) => {
                let data = JSON.parse(rawData);
                option = {
                    hostname: "intra.epitech.eu",
                    path: "/user/" + data.login + "/notes/?format=json",
                    method: "GET",
                    headers: {
                        "cookie": cookie,
                    },
                };
                let req = https.request(option, (res) => {
                    let rawData = "";
                    res.on("data", (d) => { rawData += d; });
                    res.on("end", (d) => {
                        zlib.deflate(new Buffer(rawData), (err, res) => {
                            if (err) throw err;
                            data.mark = res;
                            return callback(data);
                        });
                    })
                })
                req.on("error", (err) => {
                    return callback(undefined);
                });
                req.end();
            });
        });
        req.on("error", (err) => {
            return callback(undefined);
        });
        req.end();
    });
    req.on("error", (err) => {
        return callback(undefined);
    });
}

function setData(id, data) {
    let queryString = "UPDATE user SET gpa = ?, mark = ?, credit = ?, current_week_log = ? WHERE id = ?";
    let gpa = 0.0;
    for (let i = 0; i < data.gpa.length; ++i) {
        if (data.gpa[i].cycle == "bachelor")
            gpa = parseFloat(data.gpa[i].gpa);
    }
    let credit = parseInt(data.credits);
    let current_week_log = parseFloat(data.nsstat.active);
    let mark = data.mark;
    con.query(queryString, [gpa, mark, credit, current_week_log, id], (err, result) => {
        if (err) throw err;
    });
}

exports.fillDb = () => {
    let queryString = "SELECT id, autologin FROM user";
    con.query(queryString, (err, result) => {
        if (err) throw err;
        result.forEach(row => {
            if (row.autologin)
            getData(row.autologin, (data) => {
                setData(row.id, data);
            });
        });
    });
};

exports.getLoginWithAutologin = (autologin, callback) => {
    let req = https.get(autologin, (res) => {
        if (!("set-cookie" in res.headers))
            return callback(undefined);
        cookie = res.headers["set-cookie"];
        option = {
            hostname: "intra.epitech.eu",
            path: "/user/?format=json",
            method: "GET",
            headers: {
                "cookie": cookie,
            },
        };
        let req = https.request(option, (res) => {
            let rawData = "";
            res.on("data", (d) => { rawData += d; });
            res.on("end", (d) => {
                data = JSON.parse(rawData);
                return callback(data.login);
            });
        });
        req.on("error", (err) => {
            return callback(undefined);
        });
        req.end();
    });
    req.on("error", (err) => {
        return callback(undefined);
    });
};
