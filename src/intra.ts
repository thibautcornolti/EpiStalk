import https = require('https');
import zlib = require('zlib');
import vars = require('../vars');
import logger = require('../logger');
import { setAutologinFailed } from './account';

var con = vars.con;

function getData(autologin: string, callback: (data: { [key: string]: any } | Error) => void) {
    let userUrl = autologin + "/user/?format=json";
    let req = https.get(userUrl, (res) => {
        let rawData: string = "";
        res.on("data", (d) => { rawData += d; });
        res.on("end", (d) => {
            let data;
            try {
                data = JSON.parse(rawData);
            } catch (err) {
                logger.error(err);
                return callback(err);
            }
            if (data.message && (data.message.indexOf("Votre code d'authentification n'existe pas") == 0 || data.message.indexOf("Your authentication code does not exist or has expired.") == 0)) {
                logger.info("(intra) Wrong autologin detected");
                return callback(Error("Autologin expired!"));
            }
            let noteUrl = autologin + "/user/" + data.login + "/notes/?format=json";
            let req = https.get(noteUrl, (res) => {
                let rawData: string = "";
                res.on("data", (d) => { rawData += d; });
                res.on("end", (d) => {
                    let jsonData;
                    try {
                        jsonData = JSON.parse(rawData);
                    } catch (err) {
                        logger.error(err);
                        return callback(err);
                    }
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
                logger.error(err);
                return callback(err);
            });
            req.end();
        });
    });
    req.on("error", (err) => {
        logger.error(err);
        return callback(err);
    });
    req.end();
}

function setData(id, data, callback) {
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
        if (err) return logger.error("(sql) Error: " + err.message);
        callback();
    });
}

async function fillDb(email?: string) {
    let queryString = "SELECT id, email, autologin FROM user";
    if (email)
        queryString += " WHERE email = ?";
    logger.info("(intra) Starting to fill the database");
    con.query(queryString, [email], (err, result) => {
        if (err) return logger.error("(sql) Error: " + err.message);
        for (let i = 0; i < result.length; ++i) {
            logger.info("(intra) Planned to fill " + result[i].email + " in " + (i * 60) + " seconds");
            setTimeout(() => {
                logger.info("(intra) Filling " + result[i].email);
                let row = result[i]
                if (row.autologin)
                    getData(row.autologin, (data) => {
                        if (data instanceof Error) {
                            logger.error("(intra) Error: " + data);
                            if (data.message.indexOf("Autologin expired!") == 0)
                                setAutologinFailed(row.email);
                        } else
                            setData(row.id, data, () => {
                                logger.info("(intra) Filled " + result[i].email);
                            });
                    });
                else
                    logger.info("(intra) No autologin for " + result[i].email);
            }, i * 60 * 1000);
        }
    });
};

async function getLoginWithAutologin(autologin: string, callback: (error: Error, login?: string) => void) {
    autologin += "/user/?format=json"
    let req = https.get(autologin, (res) => {
        let rawData: string = "";
        res.on("data", (d) => { rawData += d; });
        res.on("end", (d) => {
            let data;
            try {
                data = JSON.parse(rawData);
            } catch (err) {
                logger.error(err);
                return callback(err);
            }
            return callback(undefined, data.login);
        });
    });
    req.on("error", (err) => {
        logger.error(err);
        return callback(err);
    });
};

export { fillDb, getLoginWithAutologin }
