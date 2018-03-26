import https = require('https');
import zlib = require('zlib');
import vars = require('../vars');

var con = vars.con;

function getData(autologin: string, callback: (data: { [key: string]: any } | Error) => void) {
    let req = https.get(autologin, (res) => {
        if (!("set-cookie" in res.headers))
            return callback(Error("could not get cookie"));
        let cookie = res.headers["set-cookie"];
        let option = {
            hostname: "intra.epitech.eu",
            path: "/user/?format=json",
            method: "GET",
            headers: {
                "cookie": cookie,
            },
        };
        let req = https.request(option, (res) => {
            let rawData: string;
            res.on("data", (d) => { rawData += d; });
            res.on("end", (d) => {
                let data = JSON.parse(rawData);
                let option = {
                    hostname: "intra.epitech.eu",
                    path: "/user/" + data.login + "/notes/?format=json",
                    method: "GET",
                    headers: {
                        "cookie": cookie,
                    },
                };
                let req = https.request(option, (res) => {
                    let rawData: string;
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

function fillDb(): void {
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

function getLoginWithAutologin(autologin: string, callback: (login: string | Error) => void) {
    let req = https.get(autologin, (res) => {
        if (!("set-cookie" in res.headers))
            return callback(Error("could not get cookie"));
        let cookie = res.headers["set-cookie"];
        let option = {
            hostname: "intra.epitech.eu",
            path: "/user/?format=json",
            method: "GET",
            headers: {
                "cookie": cookie,
            },
        };
        let req = https.request(option, (res) => {
            let rawData: string;
            res.on("data", (d) => { rawData += d; });
            res.on("end", (d) => {
                let data = JSON.parse(rawData);
                return callback(data.login);
            });
        });
        req.on("error", (err) => {
            return callback(err);
        });
        req.end();
    });
    req.on("error", (err) => {
        return callback(err);
    });
};

export { fillDb, getLoginWithAutologin }
