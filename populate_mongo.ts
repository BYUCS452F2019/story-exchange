var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017';
const dbName = 'story_exchange';

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  const dbo = db.db(dbName);
  const users = dbo.collection('users');
  const stories = dbo.collection('stories');
  const reviews = dbo.collection('reviews');
  const reservations = dbo.collection('reservations');

  users.insertMany([
    { UserID: 1000, UserName: 'notch', Password: 'password', Credit: 526 },
    { UserID: 1001, UserName: 'dipper', Password: 'password', Credit: 26 },
    { UserID: 1002, UserName: 'bettyTheBot', Password: 'password', Credit: 99 },
    { UserID: 1003, UserName: 'sparrow', Password: 'password', Credit: 350 },
    { UserID: 1004, UserName: 'mistborn', Password: 'password', Credit: 0 },
    { UserID: 1005, UserName: 'falcon', Password: 'password', Credit: 19 },
    {
      UserID: 1006,
      UserName: 'basic provo bro',
      Password: 'password',
      Credit: 36
    },
    { UserID: 1007, UserName: 'demo_user', Password: 'password', Credit: 106 }
  ]);

  stories.insertMany([
    {
      StoryID: 1000,
      WriterID: 1007,
      StoryURL: 'inkitt.com/fake-link',
      Title: 'Those Ills We Bear',
      Genre: 'Romance',
      Blurb: 'This is a book I put a lot of time into',
      WordCount: 50000,
      DesiredReviews: 10
    },
    {
      StoryID: 1001,
      WriterID: 1005,
      StoryURL: 'inkitt.com/fake-link',
      Title: 'What We Really Are',
      Genre: 'Fantasy',
      Blurb: 'This was based on a real dream I had in real life.',
      WordCount: 90000,
      DesiredReviews: 10
    },
    {
      StoryID: 1002,
      WriterID: 1004,
      StoryURL: 'inkitt.com/fake-link',
      Title: "Birds Aren't Real",
      Genre: 'Drama',
      Blurb: 'They were created by the CIA to spy on us',
      WordCount: 200000,
      DesiredReviews: 10
    },
    {
      StoryID: 1003,
      WriterID: 1007,
      StoryURL: 'inkitt.com/fake-link',
      Title: 'Going in Circles',
      Genre: 'Drama',
      Blurb: "I'm more of a triangle guy myself.",
      WordCount: 20000,
      DesiredReviews: 5
    },
    {
      StoryID: 1004,
      WriterID: 1003,
      StoryURL: 'inkitt.com/fake-link',
      Title: 'Uncovered',
      Genre: 'Fantasy',
      Blurb: 'Super hero novel in a futuristic society',
      WordCount: 90000,
      DesiredReviews: 7
    },
    {
      StoryID: 1005,
      WriterID: 1003,
      StoryURL: 'inkitt.com/fake-link',
      Title: 'No Bodies',
      Genre: 'Horror',
      Blurb: 'A horror/adventure/thriller/romance. This book has everything.',
      WordCount: 60000,
      DesiredReviews: 6
    },
    {
      StoryID: 1006,
      WriterID: 1002,
      StoryURL: 'inkitt.com/fake-link',
      Title: 'Modestly Mean',
      Genre: 'Fan-Fiction',
      Blurb: 'My self-insert LOTR dreams come true <3',
      WordCount: 20000,
      DesiredReviews: 1
    }
  ]);

  reviews.insertMany([
    {
      ReviewText:
        "This was not the best book I've ever read, but it also wasn't the worst.",
      ReviewerID: 1005,
      StoryID: 1000
    },
    {
      ReviewText:
        'I actually really enjoyed reading this! It made me think about my mom.',
      ReviewerID: 1002,
      StoryID: 1000
    },

    {
      ReviewText: 'Absolute garbage. Start over.',
      ReviewerID: 1003,
      StoryID: 1003
    },

    {
      ReviewText:
        'I have mixed feelings about this. On the one hand.... but then again, on the other...',
      ReviewerID: 1001,
      StoryID: 1003
    },

    {
      ReviewText:
        "This was a great story! I really liked your characters. I felt like I could never predict what Jessica would do, but I actually kind of loved that about her character. I thought the plot was pretty good, but the first quarter was a little slow for me. Chapters 4 and 5 felt like they could be combined, for example, and I don't see why chapter 7 is there at all. The biggest weakness though was with setting - I never felt like I had a good idea of where the characters were. Take some time to describe the buildings, the weather, the yellow wallpaper, whatever it takes to give me some hints and let my imagination do the rest.",
      ReviewerID: 1007,
      StoryID: 1002
    },

    {
      ReviewText:
        "Overall this was pretty solid. I like the way the characters interacted with each other and how you had a few that were constant but most of them fell in and out of the story. It made it seem more realistic. I also liked you pacing, although at some points it felt like you were stretching to hit a specific word count. If you want to improve, I would say my biggest issue was with prose. Tighten it up a little more and try to find your own voice, then keep that voice consistent throughout the story. Also, don't try to use big words if you don't know what they mean.",
      ReviewerID: 1007,
      StoryID: 1005
    }
  ]);
  reservations.insertOne({ UserID: 1007, StoryID: 1006 });
  db.close();
});
