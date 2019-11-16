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
      // let ret_reserations: Reservation[] = [];
      return reservations
        .find()
        .toArray()
        .then(saved_reservations => {
          return saved_reservations.filter(res => {
            return res.userID == userID;
          });
          // saved_reservations.forEach(reservation => {
          //   ret_reserations.push({
          //     username: user.username,
          //     password: user.password
          //   } as UserDto);
          // });
          // return ret_reserations;
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

// import { Reservation } from './types/reservation';
// import { MongoClient, Db, Collection } from 'mongodb';

// // const mongo = require('mongodb');
// // const uuidv4 = require('uuid/v4');

// export class MongoDB {
//   private client: MongoClient;
//   private DB: string;

//   constructor() {
//     const url = 'mongodb://localhost:27017/';
//     this.client = new MongoClient(url, { useUnifiedTopology: true });
//     this.DB = 'story_exchange';
//   }

//   public async getReservationsByUser(userID: number): Promise<Reservation[]> {
//     return this.client.connect().then((client: MongoClient) => {
//       const db: Db = client.db(this.DB);
//       const reservations = db.collection('reservations');
//       return reservations.find({ userID: userID });
//     });

//     // return MongoClient.connect({ useUnifiedTopology: true }, function(err, db) {
//     //   if (err) throw err;
//     //   const dbo = db.db(DB);
//     //   return dbo
//     //     .collection('reservations')
//     //     .find({})
//     //     .toArray(function(err, reservations) {
//     //       if (err) throw err;
//     //       const reservationsByUser = reservations.filter(
//     //         (reservation: Reservation) => {
//     //           return reservation.userID == userID;
//     //         }
//     //       );
//     //       db.close();
//     //       return reservationsByUser;
//     //     });
//     // });
//   }

//   public async addReservation(userID: number, storyID: number) {
//     return this.client
//       .connect()
//       .then(client => {
//         const db: Db = client.db(this.DB);
//         const reservations = db.collection('reservations');
//         return reservations.insertOne({ userID: userID });
//       })
//       .then(() => true);

//     // return this.client.connect().then((client: MongoClient) => {
//     //   const db: Db = client.db(this.DB);
//     //   const reservations = db.collection('reservations');
//     //   reservations.insertOne({ userID: userID });
//     // });

//     // MongoClient.connect(URL, { useUnifiedTopology: true }, function(err, db) {
//     //   if (err) throw err;
//     //   const reservation = { userID: userID, storyID: storyID };
//     //   const dbo = db.db(DB);
//     //   dbo.collection('reservations').insertOne(reservation, function(err, res) {
//     //     if (err) throw err;
//     //     console.log('inserted');
//     //     console.log(reservation);
//     //     console.log(res);
//     //     db.close();
//     //   });
//     // });
//     // return;
//   }
// }
