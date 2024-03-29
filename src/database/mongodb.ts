import { MongoClient, Db, ObjectId } from 'mongodb';
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
    const db: Db = this.client.db(this.dbName);
    return await db
      .collection('stories')
      .find()
      .toArray();
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
    const db: Db = this.client.db(this.dbName);
    const ID = new ObjectId(userID);
    const user = await db.collection('users').findOne({ _id: ID });

    await db.collection('stories').insertOne({
      WriterID: ID,
      Writer: user.UserName,
      StoryURL: url,
      PostedDate: new Date(),
      Title: title,
      Genre: genre,
      Blurb: blurb,
      WordCount: wordCount,
      DesiredReviews: desiredReviews
    });

    await db.collection('users').updateOne(
      { _id: ID },
      {
        $inc: {
          Credit: -postingCost
        }
      }
    );
  }

  public async getStoriesByUser(userID: number): Promise<any> {
    const db: Db = this.client.db(this.dbName);
    return await db
      .collection('stories')
      .find({ WriterID: new ObjectId(userID) })
      .toArray();
  }

  // SEARCH
  public async getBlankSearch(userID?: number): Promise<any> {
    const ID = new ObjectId(userID);
    const filter = userID ? { WriterID: { $ne: ID } } : {};
    const db: Db = this.client.db(this.dbName);
    const allStories = await db
      .collection('stories')
      .find(filter)
      .toArray();
    const filteredByUser = userID
      ? await this.filterStoriesRelatedToUser(db, allStories, ID)
      : allStories;

    // TODO: change this function's parameters in the interface to make
    // filtering by finished optional like with the regular search (this bug
    // also exists in the MariaDB implementation)
    const filteredByFinished = this.filterStoriesReviewsFinished(
      db,
      filteredByUser
    );
    return filteredByFinished;
  }

  public async searchStories(
    searchTerm: string,
    userToExclude?: number,
    includeReviewsFinished?: boolean
  ): Promise<any> {
    const db: Db = this.client.db(this.dbName);
    const userFilter = userToExclude
      ? { WriterID: { $ne: new ObjectId(userToExclude) } }
      : {};
    const regex = new RegExp(searchTerm, 'i');
    const allStories = await db
      .collection('stories')
      .find({
        ...userFilter,
        $or: [{ Writer: regex }, { Genre: regex }, { Title: regex }]
      })
      .toArray();

    const filteredByUser = userToExclude
      ? await this.filterStoriesRelatedToUser(db, allStories, userToExclude)
      : allStories;
    const filteredByFinished = includeReviewsFinished
      ? this.filterStoriesReviewsFinished(db, filteredByUser)
      : filteredByUser;

    return filteredByFinished;
  }

  private async filterStoriesRelatedToUser(
    db: Db,
    stories: any[],
    userID: ObjectId
  ): Promise<any[]> {
    const reviewsByUser = await db
      .collection('reviews')
      .find({
        ReviewerID: userID
      })
      .toArray();
    const reservationsByUser = await db
      .collection('reservations')
      .find({
        UserID: userID
      })
      .toArray();
    return stories.filter(
      story =>
        reviewsByUser.find(review => review.StoryID.equals(story._id)) ===
          undefined &&
        reservationsByUser.find(reservation =>
          reservation.StoryID.equals(story._id)
        ) === undefined
    );
  }

  private async filterStoriesReviewsFinished(
    db: Db,
    stories: any[]
  ): Promise<any[]> {
    const reviews = await db
      .collection('review')
      .find()
      .toArray();
    const reservations = await db
      .collection('reservations')
      .find()
      .toArray();

    return stories.filter(story => {
      const numReviewsOnStory = reviews.filter(review =>
        review.StoryID.equals(story._id)
      ).length;
      const numReservationsOnStory = reservations.filter(reservation =>
        reservation.StoryID.equals(story._id)
      ).length;

      return numReviewsOnStory + numReservationsOnStory < story.DesiredReviews;
    });
  }

  // REVIEWS
  async getReviewsByUser(userID: number) {
    const db: Db = this.client.db(this.dbName);
    return db
      .collection('reviews')
      .find({ ReviewerID: new ObjectId(userID) })
      .toArray();
  }

  async getReviewsByStory(storyID: number) {
    const db: Db = this.client.db(this.dbName);
    return db
      .collection('reviews')
      .find({ StoryID: new ObjectId(storyID) })
      .toArray();
  }

  async addReview(review: Review, creditEarned: number) {
    const db: Db = this.client.db(this.dbName);
    const reviews = db.collection('reviews');
    const reviewerID = new ObjectId(review.ReviewerID);
    const storyID = new ObjectId(review.StoryID);
    const otherReviews = await reviews
      .find({
        ReviewerID: reviewerID,
        StoryID: storyID
      })
      .toArray();
    if (otherReviews.length > 0) {
      throw new Error('Review from this user already exists for this story');
    }
    reviews.insertOne({
      ReviewText: review.ReviewText,
      ReviewerID: reviewerID,
      StoryID: storyID
    });
    db.collection('reservations').deleteOne({
      UserID: reviewerID,
      StoryID: storyID
    });
    const stories = db.collection('stories');
    const savedStory = await stories.findOne({
      _id: storyID
    });
    const desiredReviews = savedStory.DesiredReviews;
    if (desiredReviews - 1 >= 0) {
      const storyQuery = { _id: storyID };
      const newDesiredReviews = {
        $set: { DesiredReviews: desiredReviews - 1 }
      };
      stories.updateOne(storyQuery, newDesiredReviews, function(err, res) {
        if (err) throw err;
      });
    }
    const users = db.collection('users');
    const savedUser = await db.collection('users').findOne({ _id: reviewerID });
    const userQuery = { _id: reviewerID };
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
    const reviewQuery = { _id: new ObjectId(reviewID) };
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
    const reservation = {
      UserID: new ObjectId(userID),
      StoryID: new ObjectId(storyID)
    };
    const allReservations = db.collection('reservations');
    const otherReservations = await allReservations.find(reservation).toArray();
    if (otherReservations.length > 0) {
      throw new Error('User has already reserved this story for review');
    }
    db.collection('reservations').insertOne(reservation);
    return true;
  }

  async getReservationsByUser(userID: string): Promise<Reservation[]> {
    const db: Db = this.client.db(this.dbName);
    return db
      .collection('reservations')
      .find({ UserID: new ObjectId(userID) })
      .toArray();
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
      UserID: maybeUser[0]._id,
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
