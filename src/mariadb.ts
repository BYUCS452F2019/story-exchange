const mariadb = require("mariadb");
const uuidv4 = require('uuid/v4');

export class MariaDB {
    constructor() {

    }

    public async register(username: string, password: string) {
        const conn = await this.createConnection()
        const otherUsers = await conn.query(
            `SELECT * 
             FROM Users
             WHERE UserName="${username}"`
        );
        if (otherUsers.length > 0) {
            conn.end();
            throw new Error('Username is taken');
        }
        await conn.query(
		    `INSERT INTO Users (UserName, Password, Credit) values (
             "${username}",
             "${password}",
            0
            )`
        );
        conn.end();
        
        return await this.loginUser(username, password);
    }

    public async loginUser(username: string, password: string) {
        const conn = await this.createConnection();
        const requestedUser = await conn.query(
            `SELECT *
             FROM Users
             WHERE UserName="${username}"`
        );
        if (requestedUser.length == 0 || requestedUser[0].Password != password) {
            throw new Error('Invalid Username or Password');
        }
        const sessionToken = uuidv4().substring(0, 16);
        const expirationDate = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        expirationDate.setTime(expirationDate.getTime() + oneDay);
        await conn.query(
            `INSERT INTO LoginSessions (SessionToken, UserID, Expires) values (
             "${sessionToken}",
             "${requestedUser[0].UserID}",
             "${expirationDate.toISOString().slice(0, 19).replace('T', ' ')}")
            `
        );
        conn.end();
        return sessionToken;
    }

    private createConnection() {
        return  mariadb.createConnection({
            user: "db_admin",
            database: "story_exchange",
            host: "localhost",
            password: "fake42",
            port: 3306,
        });
    }
}