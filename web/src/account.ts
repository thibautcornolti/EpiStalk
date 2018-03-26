import bcrypt = require('bcrypt')

class User {
    token: string;
    email: string;
    constructor(token?: string, email?: string) {
        this.token = token;
        this.email = email;
    }
}

function register(email: string, password: string, con, callback: (error?: Error) => void): void {
    bcrypt.hash(password, 5, (err, hashedPassword) => {
        if (err) throw err;
        let queryString: string = "SELECT email FROM user WHERE email = ?";
        con.query(queryString, [email], (err, result) => {
            if (err) throw err;
            if (result.length > 0)
                return callback(Error("already registered"));
            var queryString = "INSERT INTO user (email, password) VALUES (?, ?)";
            con.query(queryString, [email, hashedPassword], (err, result) => {
                if (err) throw err;
                return callback();
            });
        })
    });
};

function login(email: string, password: string, sessionid: string, con, callback: (user: User | Error) => void): void {
    var queryString = "SELECT id, password FROM user WHERE email = ?";
    con.query(queryString, [email], (err, result) => {
        if (err) throw err;
        if (result.length == 0)
            return callback(Error("user not found"));
        bcrypt.compare(password, result[0].password, (err, res) => {
            if (err) throw err;
            if (!res)
                return callback(Error("bad password"));
            var queryString = "INSERT INTO token (id_user, token) VALUES (?, ?)";
            con.query(queryString, [result[0].id, sessionid], (err, result) => {
                if (err) throw err;
                return callback(
                    new User(sessionid, email)
                );
            });
        });
    });
};

function logout(sessionid: string, con, callback: (error?: Error) => void): void {
    var queryString = "DELETE FROM token WHERE token = ?";
    con.query(queryString, [sessionid], (err, result) => {
        if (err) throw err;
        return callback();
    });
};

function isLogged(sessionid: string, con, callback: (user: User | Error) => void): void {
    var queryString = "SELECT id_user, valid_date FROM token WHERE token = ?";
    con.query(queryString, [sessionid], (err, result) => {
        if (err) throw err;
        if (result.length == 0)
            return callback(Error("token not found"));
        var queryString = "SELECT email FROM user WHERE id = ?";
        con.query(queryString, [result[0].id_user], (err, result) => {
            if (err) throw err;
            if (result.length == 0)
                return callback(undefined);
            return callback(new User(sessionid, result[0]["email"]));
        });
    });
};

export { register, login, logout, isLogged }
