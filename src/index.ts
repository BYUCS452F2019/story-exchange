import { MockDB } from './mockdb';
import { MariaDB } from './mariadb';
import { Request, Response } from 'express';

const express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const ip = require('ip');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const db = new MockDB();
const mariaDB = new MariaDB();

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () =>
  console.log(`Example app listening on ${ip.address()}:${port}!`)
);

app.get('/stories', (req, res) => {
  res.send(JSON.stringify(db.getStories()));
});

app.get('/review-reservations', (req, res) => {
  res.send(db.getReviewReservations());
});

app.get('/reviews', (req, res) => {
  if (req.body.userID) {
    mariaDB
      .getReviewsByUser(req.body.userID)
      .then(reviews => {
        res.send(reviews);
      })
      .catch(error => {
        res.status(500).send(error.message);
      });
  } else if (req.body.storyID) {
    mariaDB
      .getReviewsByStory(req.body.storyID)
      .then(reviews => {
        res.send(reviews);
      })
      .catch(error => {
        res.status(500).send(error.message);
      });
  } else {
    res.status(400).send('Bad Request');
  }
});

app.post('/reviews', (req, res) => {
  mariaDB
    .addReview(req.body.reviewText, req.body.reviewerID, req.body.storyID)
    .then(res.status(200).send())
    .catch(error => {
      console.log(error.message);
      const msg = 'Review from this user already exists for this story';
      if (error.message == msg) {
        res.status(403).send(msg);
      } else {
        res.status(500).send('Internal Server Error');
      }
    });
});

app.post('/rating', (req, res) => {
  mariaDB
    .rateReview(req.body.reviewID, req.body.rating)
    .then(res.status(200).send())
    .catch(error => {
      console.log(error.message);
      const msg = 'Review does not exist';
      if (error.message == msg) {
        res.status(403).send(msg);
      } else {
        res.status(500).send('Internal Server Error');
      }
    });
});

app.get('/reservations/:userID', (req, res) => {
  mariaDB
    .getReservationsByUser(req.params.userID)
    .then(reservations => {
      res.send(reservations);
    })
    .catch(error => {
      res.status(500).send(error.message);
    });
});

app.post('/reservations', (req, res) => {
  mariaDB
    .addReservation(req.body.userID, req.body.storyID)
    .then(res.status(200).send())
    .catch(error => {
      console.log(error.message);
      const msg = 'Error: User has already reserved this story for review';
      if (error.message == msg) {
        res.status(403).send(msg);
      } else {
        res.status(500).send('Internal Server Error');
      }
    });
});

app.post('/register', (req: Request, res: Response) => {
  mariaDB
    .register(req.body.UserName, req.body.Password)
    .then(loginPackage => {
      res.send(JSON.stringify(loginPackage));
    })
    .catch(error => {
      console.log(error.message);
      if (error.message == 'Username is taken') {
        res.status(401).send('That username is already in use');
      } else {
        res.status(500).send('Internal Server Error');
      }
    });
});

app.post('/login', (req, res) => {
  mariaDB
    .loginUser(req.body.UserName, req.body.Password)
    .then(loginPackage => {
      res.send(JSON.stringify(loginPackage));
    })
    .catch(error => {
      console.log(error.message);
      if (error.message == 'Invalid Username or Password') {
        res.status(401).send('Invalid Username or Password');
      } else {
        res.status(500).send('Internal Server Error');
      }
    });
});
