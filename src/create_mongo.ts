var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017';
const dbName = 'story_exchange';

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  const dbo = db.db(dbName);
  console.log('Database created!');
  db.createUser({ user: 'admin', pwd: 'secret-password' });
  dbo.createCollection('reservations', function(err, res) {
    if (err) throw err;
    console.log('Collection created!');
  });
  dbo.createCollection('users', function(err, res) {
    if (err) throw err;
  });
  db.close();
});
