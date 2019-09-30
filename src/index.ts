import {MockDB} from './mockdb';

const express = require('express');
var cors = require('cors');
const ip = require("ip");
const app = express()
const port = 3000

app.use(cors());

const db = new MockDB();

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on ${ip.address()}:${port}!`))


app.get('/stories', (req, res) => {
    res.send(JSON.stringify(db.getStories()));
})

app.get('/review-reservations', (req, res) => {
    res.send(db.getReviewReservations());
})