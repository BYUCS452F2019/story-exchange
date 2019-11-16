var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017';
const dbName = 'story_exchange';

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log('Database created!');
  const dbo = db.db(dbName);
  dbo.createCollection('reservations', function(err, res) {
    if (err) throw err;
    console.log('Collection created!');
  });
  db.close();
});
