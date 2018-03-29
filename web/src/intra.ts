import Promise = require('promise');
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
            let rawData: string = "";
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
                    let rawData: string = "";
                    res.on("data", (d) => { rawData += d; });
                    res.on("end", (d) => {
                        let jsonData = JSON.parse(rawData);
                        let pMark = new Promise((resolve, reject) => {
                            zlib.deflate(new Buffer(JSON.stringify(jsonData.notes)), (err, res) => {
                                if (err) reject(err);
                                data.mark = res;
                                resolve();
                            });
                        });
                        let pRank = new Promise((resolve, reject) => {
                            zlib.deflate(new Buffer(JSON.stringify(jsonData.modules)), (err, res) => {
                                if (err) reject(err);
                                data.rank = res;
                                resolve();
                            });
                        });
                        Promise.all([pMark, pRank]).then(() => {
                            return callback(data);
                        }, (err) => { throw err; });
                    });
                });
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
    let queryString = "UPDATE user SET city = ?, promo = ?, gpa = ?, rank = ?, mark = ?, credit = ?, current_week_log = ? WHERE id = ?";
    let gpa = 0.0;
    for (let i = 0; i < data.gpa.length; ++i) {
        if (data.gpa[i].cycle == "bachelor")
            gpa = parseFloat(data.gpa[i].gpa);
    }
    let city = data.location;
    let promo = data.promo;
    let credit = parseInt(data.credits);
    let current_week_log = parseFloat(data.nsstat.active);
    let rank = data.rank;
    let mark = data.mark;
    con.query(queryString, [city, promo, gpa, rank, mark, credit, current_week_log, id], (err, result) => {
        if (err) throw err;
    });
}

function fillDb(email?: string): void {
    let queryString = "SELECT id, autologin FROM user";
    if (email)
        queryString += " WHERE email = ?";
    con.query(queryString, [email], (err, result) => {
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
            let rawData: string = "";
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
