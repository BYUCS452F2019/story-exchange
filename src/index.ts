import { MockDB } from './mockdb';
import { MariaDB } from './mariadb';
import { MongoDB } from './mongodb';
import { Request, Response } from 'express';
import { Review } from './types/review';

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
const mongoDB = new MongoDB();

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () =>
  console.log(`Example app listening on ${ip.address()}:${port}!`)
);

app.get('/stories', (req, res) => {
  mariaDB
    .getStories()
    .then(stories => {
      res.send(stories);
    })
    .catch(error => {
      res.status(500).send(error.message);
      console.log('In get stories');
      console.error(error);
    });
});

app.get('/stories/:userID', (req, res) => {
  mariaDB
    .getStoriesByUser(req.params.userID)
    .then(stories => {
      res.send(stories);
    })
    .catch(error => {
      res.status(500).send(error.message);
      console.log('in get stories/:userID');
      console.error(error);
    });
});

app.get('/feed/:userID', (req, res) => {
  mariaDB
    .getBlankSearch(req.params.userID)
    .then(stories => {
      res.send(stories);
    })
    .catch(error => {
      res.status(500).send(error.message);
      console.log('in get feed/:userID');
      console.error(error);
    });
});

app.get('/stories/search/:searchTerm', (req, res) => {
  mariaDB
    .searchStories(req.params.searchTerm, req.query.user, req.query.all)
    .then(stories => {
      res.send(stories);
    })
    .catch(error => {
      res.status(500).send(error.message);
      console.log('in get stories/search/:searchTerm');
      console.error(error);
    });
});

app.post('/stories', (req, res) => {
  mariaDB
    .addStory(
      req.body.authorID,
      req.body.link,
      req.body.title,
      req.body.genre,
      req.body.blurb,
      req.body.wordCount,
      req.body.desiredReviews,
      req.body.postingCost
    )
    .then(() => {
      res.status(200).send();
    })
    .catch(error => {
      res.status(500).send(error.message);
      console.log('in post stories');
      console.error(error);
    });
});

app.get('/review-reservations', (req, res) => {
  res.send(db.getReviewReservations());
});

app.get('/reviews/user/:userID', (req, res) => {
  mariaDB
    .getReviewsByUser(req.params.userID)
    .then(reviews => {
      res.send(reviews);
    })
    .catch(error => {
      res.status(500).send(error.message);
      console.error(error);
    });
});

app.get('/reviews/story/:storyID', (req, res) => {
  mariaDB
    .getReviewsByStory(req.params.storyID)
    .then(reviews => {
      res.send(reviews);
    })
    .catch(error => {
      res.status(500).send(error.message);
      console.error(error);
    });
});

app.post('/reviews', (req, res) => {
  mariaDB
    .addReview(req.body.review as Review, req.body.creditEarned)
    .then(res.status(200).send())
    .catch(error => {
      console.log(error.message);
      const msg = 'Review from this user already exists for this story';
      if (error.message == msg) {
        res.status(403).send(msg);
      } else {
        res.status(500).send('Internal Server Error');
        console.error(error);
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
        console.error(error);
      }
    });
});

app.get('/reservations/:userID', (req, res) => {
  mongoDB
    .getReservationsByUser(req.params.userID)
    .then(reservations => {
      res.send(reservations);
    })
    .catch(error => {
      res.status(500).send(error.message);
      console.error(error);
    });
  // mariaDB
  //   .getReservationsByUser(req.params.userID)
  //   .then(reservations => {
  //     res.send(reservations);
  //   })
  //   .catch(error => {
  //     res.status(500).send(error.message);
  //     console.error(error);
  //   });
});

app.post('/reservations', (req, res) => {
  mongoDB
    .addReservation(req.body.userID, req.body.storyID)
    .then(res.status(200).send())
    .catch(error => {
      console.log(error.message);
      const msg = 'Error: User has already reserved this story for review';
      if (error.message == msg) {
        res.status(403).send(msg);
      } else {
        res.status(500).send('Internal Server Error');
        console.error(error);
      }
    });
  // mariaDB
  //   .addReservation(req.body.userID, req.body.storyID)
  //   .then(res.status(200).send())
  //   .catch(error => {
  //     console.log(error.message);
  //     const msg = 'Error: User has already reserved this story for review';
  //     if (error.message == msg) {
  //       res.status(403).send(msg);
  //     } else {
  //       res.status(500).send('Internal Server Error');
  //       console.error(error);
  //     }
  //   });
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
        console.error(error);
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
        console.error(error);
      }
    });
});
