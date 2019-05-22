var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var myobj = [
    { typeName: 'Браслет' },
    { typeName: 'Кольє' },
    { typeName: 'Сережки' }
  

  ];
  db.collection("gemsis_producttypes").insertMany(myobj, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
  });
});