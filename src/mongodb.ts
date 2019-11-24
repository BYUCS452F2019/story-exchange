import { MongoClient, Db } from 'mongodb';
import { Reservation } from './types/reservation';
import { Review } from './types/review';

export class MongoDB {
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
    this.dbName = dbName;
  }

  getReviewsByUser(userID: number) {
    return this.client.connect().then(client => {
      const db: Db = client.db(this.dbName);
      const reviews = db.collection('reviews');
      return reviews.find({ UserID: userID });
    });
  }

  getReviewsByStory(storyID: number) {
    return this.client.connect().then(client => {
      const db: Db = client.db(this.dbName);
      const reviews = db.collection('reviews');
      return reviews.find({ StoryID: storyID });
    });
  }

  addReview(review: Review, creditEarned: number) {
    return this.client.connect().then(client => {
      const db: Db = client.db(this.dbName);
      const reviews = db.collection('reviews');
      const otherReviews = reviews.findAll({ ReviewerID: review.ReviewerID });
      if (otherReviews.length > 0) {
        db.close();
        throw new Error('Review from this user already exists for this story');
      }
      reviews.insertOne({
        ReviewText: review.ReviewText,
        ReviewerID: review.ReviewerID,
        StoryID: review.StoryID
      });
      const reservations = db.collection('reservtions');
      reservations.deleteOne({
        UserID: review.ReviewerID,
        StoryID: review.StoryID
      });
      const stories = db.collection('stories');
      const desiredReviews = stories.find({ StoryID: review.StoryID })
        .desiredReviews;
      if (desiredReviews - 1 >= 0) {
        const storyQuery = { StoryID: review.StoryID };
        const newDesiredReviews = {
          $set: { desiredReviews: desiredReviews - 1 }
        };
        stories.updateOne(storyQuery, newDesiredReviews, function(err, res) {
          if (err) throw err;
          db.close();
        });
      }
      const users = db.collection('users');
      const curCredit = users.find({ UserID: review.ReviewerID });
      const userQuery = { UserID: review.ReviewerID };
      const newCredit = { $set: { Credit: curCredit + creditEarned } };
      users.updateOne(userQuery, newCredit, function(err, res) {
        {
          if (err) throw err;
          db.close();
        }
      });
    });
  }

  rateReview(reviewID: number, rating: number) {
    return this.client.connect().then(client => {
      const db: Db = client.db(this.dbName);
      const reviewQuery = { reviewID: reviewID };
      const newRating = { $set: { rating: rating } };
      db.collection('reviews').updateOne(reviewQuery, newRating, function(
        err,
        res
      ) {
        if (err) throw err;
        db.close();
      });
    });
  }

  addReservation(userID: number, storyID: number): Promise<boolean> {
    return this.client
      .connect()
      .then(client => {
        const db: Db = client.db(this.dbName);
        const reservations = db.collection('reservations');
        return reservations.insertOne({ userID: userID, storyID: storyID });
      })
      .then(() => true);
  }

  getReservationsByUser(userID: number): Promise<Reservation[]> {
    return this.client.connect().then((client: MongoClient) => {
      const db: Db = client.db(this.dbName);
      const reservations = db.collection('reservations');
      return reservations.find({ UserID: userID });
    });
  }

  removeUserByName(userName: string): Promise<null> {
    return this.client
      .connect()
      .then((client: MongoClient) => {
        const db: Db = client.db(this.dbName);
        return db.collection('users').deleteOne({ username: userName });
      })
      .then(() => null);
  }

  clearUsers(): Promise<null> {
    return this.client
      .connect()
      .then((client: MongoClient) => {
        const db: Db = client.db(this.dbName);
        return db.collection('users').deleteMany({});
      })
      .then(() => null);
  }
}
