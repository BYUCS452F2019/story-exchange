import { MongoClient, Db } from 'mongodb';
import { Reservation } from './types/reservation';

export class MongoDB {
  private client: MongoClient;
  private dbName: string;
  constructor({
    url = 'mongodb://localhost:27017',
    dbName = 'story_exchange'
  } = {}) {
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.dbName = dbName;
  }

  addReservation(userID: number, storyID: number): Promise<boolean> {
    return this.client
      .connect()
      .then(client => {
        const db: Db = client.db(this.dbName);
        const reservations = db.collection('reservations');
        const reservation = { userID: userID, storyID: storyID };
        return reservations.insertOne(reservation);
      })
      .then(() => true);
  }

  getReservationsByUser(userID: number): Promise<Reservation[]> {
    return this.client.connect().then((client: MongoClient) => {
      const db: Db = client.db(this.dbName);
      const reservations = db.collection('reservations');
      return reservations
        .find()
        .toArray()
        .then(saved_reservations => {
          return saved_reservations.filter(res => {
            return res.userID == userID;
          });
        });
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
