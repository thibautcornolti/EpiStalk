import logger = require("../logger");
import { getUser } from "./account";

/* Middleware function to check token for render endpoints */
function withLogin(req, res, next) {
    let token = req.cookies.token
    if (!token) {
        logger.info("(login) Token not found");
        res.redirect('login');
    } else {
        getUser(token, (err, user) => {
            if (err) {
                logger.info("(login) Error: " + err.message);
                res.redirect('login');
            } else {
                logger.info("(login) Logged: " + user.email);
                req.user = user;
                next();
            }
        });
    }
}

/* Middleware function to check token for api endpoints */
function withAPILogin(req, res, next) {
    let token = req.cookies.token
    if (!token) {
        logger.info("(login) Token not found");
        res.status(403).send({ error: "Token not found" });
    } else {
        getUser(token, (err, user) => {
            if (err) {
                logger.info("(login) Error: " + err.message);
                res.status(403).send({ error: "Invalid credentials" });
            } else {
                logger.info("(login) Logged: " + user.email);
                req.user = user;
                next();
            }
        });
    }
}

/* Middleware to log endpoints */
function withLog(req, res, next) {
    logger.info("(http) " + req.method + " on " + req.url + " from " + req.connection.remoteAddress);
    next();
}

export { withAPILogin, withLogin, withLog };
