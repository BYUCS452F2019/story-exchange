import { MockDB } from "./mockdb";
import { MariaDB } from "./mariadb";
import { Request, Response } from "express";

const express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
const ip = require("ip");
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const db = new MockDB();
const mariaDB = new MariaDB();

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () =>
  console.log(`Example app listening on ${ip.address()}:${port}!`)
);

app.get("/stories", (req, res) => {
  res.send(JSON.stringify(db.getStories()));
});

app.get("/review-reservations", (req, res) => {
  res.send(db.getReviewReservations());
});

app.get("/reviews", (req, res) => {
  res.send(mariaDB.getReviews());
});

app.post("/reviews", (req, res) => {
  mariaDB
    .addReview(req.body.reviewText, req.body.reviewerID, req.body.storyID)
    .then(res.status(200))
    .catch(error => {
      console.log(error.message);
      const msg = "Review from this user already exists for this story";
      if (error.message == msg) {
        res.status(403).send(msg);
      } else {
        res.status(500).send("Internal Server Error");
      }
    });
});

app.get("/reservations", (req, res) => {
  res.send(mariaDB.getReservations());
});

app.post("/reservations", (req, res) => {
  mariaDB
    .addReservation(req.body.userID, req.body.storyID)
    .then(res.status(200))
    .catch(error => {
      console.log(error.message);
      const msg = "User has already reserved this story for review";
      if (error.message == msg) {
        res.status(403).send(msg);
      } else {
        res.status(500).send("Internal Server Error");
      }
    });
});

app.post("/register", (req: Request, res: Response) => {
  mariaDB
    .register(req.body.UserName, req.body.Password)
    .then(token => {
      res.send(token);
    })
    .catch(error => {
      console.log(error.message);
      if (error.message == "Username is taken") {
        res.status(401).send("That username is already in use");
      } else {
        res.status(500).send("Internal Server Error");
      }
    });
});

app.post("/login", (req, res) => {
  mariaDB
    .loginUser(req.body.UserName, req.body.Password)
    .then(token => {
      res.send(token);
    })
    .catch(error => {
      console.log(error.message);
      if (error.message == "Invalid Username or Password") {
        res.status(401).send("Invalid Username or Password");
      } else {
        res.status(500).send("Internal Server Error");
      }
    });
});
