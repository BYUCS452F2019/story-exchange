import { MongoClient, Db } from 'mongodb';
import { Reservation } from './types/reservation';

import uuidv4 = require('uuid/v4');

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
    this.client.connect();
    this.dbName = dbName;
  }

  async addReservation(userID: number, storyID: number): Promise<boolean> {
    const db: Db = this.client.db(this.dbName);
    const reservations = db.collection('reservations');
    const reservation = { userID: userID, storyID: storyID };
    reservations.insertOne(reservation);

    return true;
  }

  getReservationsByUser(userID: number): Promise<Reservation[]> {
    const db: Db = this.client.db(this.dbName);
    const reservations = db.collection('reservations');
    return reservations
      .find()
      .toArray()
      .then(saved_reservations => {
        return saved_reservations.filter(res => {
          return res.userID == userID;
        });
      });
  }

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
