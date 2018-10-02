import mysql = require('mysql');

let isMaster: boolean = false;
let disableRegistrations: boolean = (process.env.DISABLE_REGISTRATIONS != undefined);
let secretToken: string = "secrettoken";
let secretCookie: string = "secretcookie";
let hostname: string = 'hostname';
let hostSQL: string = "hostsql";
let port: number = parseInt(process.env.SERVER_PORT) || 3000;
let con;

function createConnection() {
    con = mysql.createConnection({
        host: hostSQL,
        user: "sqluser",
        password: "sqlpassword",
        database: "sqldatabase"
    });
}

function setMaster() { isMaster = true; };

export { isMaster, setMaster, disableRegistrations, hostname, hostSQL, port, con, secretToken, secretCookie, createConnection };
