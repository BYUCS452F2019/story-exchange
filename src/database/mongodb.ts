import { MongoClient, Db } from 'mongodb';
import { Reservation } from '../types/reservation';
import { Review } from '../types/review';

import uuidv4 = require('uuid/v4');
import { Database } from './database';

export class MongoDB implements Database {
  private client: MongoClient;
  private dbName: string;
  constructor({
    url = 'mongodb://localhost:27017',
    dbName = 'story_exchange'
  } = {}) {
    this.client = new MongoClient(
      url,
      { useUnifiedTopology: true },
      {
        auth: {
          user: 'admin',
          password: 'secret-password'
        }
      }
    );
    this.client.connect();
    this.dbName = dbName;
  }

  // STORIES
  public async getStories(): Promise<any> {

  }

  public async addStory(
    userID: number,
    url: string,
    title: string,
    genre: string,
    blurb: string,
    wordCount: number,
    desiredReviews: number,
    postingCost: number
  ): Promise<any> {
    
  }

  public async getStoriesByUser(userID: number): Promise<any> {

  }

  // SEARCH
  public async getBlankSearch(userID?: number): Promise<any> {

  }
  public async searchStories(
    searchTerm: string,
    userToExclude?: string,
    includeReviewsFinished?: boolean
  ): Promise<any> {

  }

  // REVIEWS
  async getReviewsByUser(userID: number) {
    const db: Db = this.client.db(this.dbName);
    return db
      .collection('reviews')
      .find({ ReviewerID: userID })
      .toArray();
  }

  async getReviewsByStory(storyID: number) {
    const db: Db = this.client.db(this.dbName);
    return db
      .collection('reviews')
      .find({ StoryID: storyID })
      .toArray();
  }

  async addReview(review: Review, creditEarned: number) {
    const db: Db = this.client.db(this.dbName);
    const reviews = db.collection('reviews');
    const otherReviews = await reviews
      .find({ ReviewerID: review.ReviewerID })
      .toArray();
    if (otherReviews.length > 0) {
      throw new Error('Review from this user already exists for this story');
    }
    reviews.insertOne({
      ReviewText: review.ReviewText,
      ReviewerID: review.ReviewerID,
      StoryID: review.StoryID
    });
    db.collection('reservations').deleteOne({
      UserID: review.ReviewerID,
      StoryID: review.StoryID
    });
    const stories = db.collection('stories');
    const savedReview = await stories.findOne({ _id: review.StoryID });
    const desiredReviews = savedReview.DesiredReviews;
    if (desiredReviews - 1 >= 0) {
      const storyQuery = { _id: review.StoryID };
      const newDesiredReviews = {
        $set: { DesiredReviews: desiredReviews - 1 }
      };
      stories.updateOne(storyQuery, newDesiredReviews, function(err, res) {
        if (err) throw err;
      });
    }
    const users = db.collection('users');
    const savedUser = await db
      .collection('users')
      .findOne({ _id: review.ReviewerID });
    const userQuery = { _id: review.ReviewerID };
    const newCredit = { $set: { Credit: savedUser.Credit + creditEarned } };
    users.updateOne(userQuery, newCredit, function(err, res) {
      {
        if (err) throw err;
      }
    });
    return;
  }

  async rateReview(reviewID: number, rating: number) {
    const db: Db = this.client.db(this.dbName);
    const reviewQuery = { _id: reviewID };
    const newRating = { $set: { Rating: rating } };
    db.collection('reviews').updateOne(reviewQuery, newRating, function(
      err,
      res
    ) {
      if (err) throw err;
    });
    return;
  }

  // RESERVATIONS
  async addReservation(userID: number, storyID: number): Promise<boolean> {
    const db: Db = this.client.db(this.dbName);
    const reservation = { UserID: userID, StoryID: storyID };
    db.collection('reservations').insertOne(reservation);
    return true;
  }

  async getReservationsByUser(userID: number): Promise<Reservation[]> {
    const db: Db = this.client.db(this.dbName);
    const res = await db.collection('reservations').findOne({ UserID: userID });
    return res;
  }

  // USERS
  removeUserByName(userName: string): Promise<null> {
    const db: Db = this.client.db(this.dbName);
    return db.collection('users').deleteOne({ username: userName });
  }

  clearUsers(): Promise<null> {
    const db: Db = this.client.db(this.dbName);
    return db.collection('users').deleteMany({});
  }

  async register(userName: string, password: string) {
    const db: Db = this.client.db(this.dbName);
    const previousUsers = await db
      .collection('users')
      .find({ UserName: userName })
      .toArray();
    if (previousUsers.length > 0) {
      throw new Error('Username is taken');
    }
    const new_user = { UserName: userName, Password: password, Credit: 0 };
    db.collection('users').insertOne(new_user);
    return this.loginUser(userName, password);
  }

  async loginUser(userName: string, password: string) {
    const db: Db = this.client.db(this.dbName);
    const maybeUser = await db
      .collection('users')
      .find({ UserName: userName })
      .toArray();
    if (maybeUser.length == 0 || maybeUser[0].Password != password) {
      throw new Error('Invalid Username or Password');
    }
    const sessionToken = uuidv4().substring(0, 16);
    const expirationDate = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    expirationDate.setTime(expirationDate.getTime() + oneDay);

    const new_entry = {
      SessionToken: sessionToken,
      UserID: maybeUser[0].UserID,
      Expires: expirationDate
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ')
    };

    await db.collection('users').insertOne(new_entry);

    const fullUser = maybeUser[0];
    delete fullUser.Password;
    return { token: sessionToken, user: fullUser };
  }
}
