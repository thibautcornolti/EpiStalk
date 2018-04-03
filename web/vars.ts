import mysql = require('mysql');

let disableRegistrations: boolean = (process.env.DISABLE_REGISTRATIONS != undefined);
let secretToken: string = "ouibite";
let secretCookie: string = "biteoui";
let hostname: string = 'localhost';
let hostSQL: string = "104.155.43.170";
let port: number = 3000;
let con;

function createConnection() {
    con = mysql.createConnection({
        host: hostSQL,
        user: "thibaut",
        password: "9a54a1b8b389c753dda13f126c856425",
        database: "epistalk"
    });
}

export { disableRegistrations, hostname, hostSQL, port, con, secretToken, secretCookie, createConnection };
