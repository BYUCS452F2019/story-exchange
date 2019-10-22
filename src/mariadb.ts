import { Reservation } from './types/reservation';

const mariadb = require('mariadb');
const uuidv4 = require('uuid/v4');

export class MariaDB {
  constructor() {}

  public async getReviewsByUser(userID: number) {
    const conn = await this.createConnection();
    const reviews = await conn.query(
      `SELECT *
        FROM Reviews
        WHERE ReviewerID=${userID}`
    );
    conn.end();
    return reviews;
  }

  public async getReviewsByStory(storyID: number) {
    const conn = await this.createConnection();
    const reviews = await conn.query(
      `SELECT *
        FROM Reviews
        WHERE StoryID=${storyID}`
    );
    conn.end();
    return reviews;
  }

  public async addReview(
    reviewText: string,
    reviewerID: number,
    storyID: number
  ) {
    const conn = await this.createConnection();
    const otherReviews = await conn.query(
      `SELECT * 
            FROM Reviews
            WHERE ReviewerID="${reviewerID}" AND StoryID="${storyID}"`
    );
    if (otherReviews.length > 0) {
      conn.end();
      throw new Error('Review from this user already exists for this story');
    }
    await conn.query(
      `INSERT INTO Reviews (ReviewText, ReviewerID, StoryID)
            values ("${reviewText}", ${reviewerID}, ${storyID})`
    );
    await conn.query(
      `DELETE FROM Reservations 
        WHERE UserID = ${reviewerID}
        AND StoryID = ${storyID}`
    );
    conn.end();
    return;
  }

  public async rateReview(reviewID: number, rating: number) {
    const conn = await this.createConnection();
    const reviews = await conn.query(
      `SELECT * 
            FROM Reviews
            WHERE ReviewID=${reviewID}`
    );
    if (reviews.length === 0) {
      conn.end();
      throw new Error('Review does not exist');
    }
    await conn.query(
      `UPDATE Reviews SET Stars="${rating}" WHERE ReviewID="${reviewID}"`
    );
    conn.end();
    return;
  }

  public async getReservationsByUser(userID: number): Promise<Reservation[]> {
    const conn = await this.createConnection();
    const reservations = await conn.query(
      `SELECT *
        FROM Reservations
        WHERE UserID=${userID}`
    );
    conn.end();
    console.log(reservations);
    return reservations;
  }

  public async addReservation(userID: number, storyID: number) {
    const conn = await this.createConnection();
    const otherReservations = await conn.query(
      `SELECT * 
            FROM Reservations
            WHERE UserID="${userID}" AND StoryID="${storyID}"`
    );
    if (otherReservations.length > 0) {
      conn.end();
      throw new Error('User has already reserved this story for review');
    }
    await conn.query(`INSERT INTO Reservations values (${userID}, ${storyID})`);
    conn.end();
    return;
  }

  public async register(username: string, password: string) {
    const conn = await this.createConnection();
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
             "${expirationDate
               .toISOString()
               .slice(0, 19)
               .replace('T', ' ')}")
            `
    );
    conn.end();
    return sessionToken;
  }

  private createConnection() {
    return mariadb.createConnection({
      user: 'db_admin',
      database: 'story_exchange',
      host: 'localhost',
      password: 'fake42',
      port: 3306
    });
  }
}
