var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/story_exchange';

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log('Database created!');
  // db.createCollection("name", function(err, res) {
  //   if (err) throw err;
  //   console.log("Collection created!");
  // });
  db.close();
});
