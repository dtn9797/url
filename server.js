
var express = require('express');
var app = express();
var url=process.env.SECRET;
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

app.use(express.static('public'));

//callback json
var json={};
var urlID=1;
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.use("/new/:l", function (request, response) {
  //fix this one
  var link=request.originalUrl.substring(5,request.originalUrl.length);
  console.log(request.originalUrl.substring(5,request.originalUrl.length));
  if (!isUrl(link)){
    json={'err': 'the url is unvalid'};
    response.send(json);
  }
  else {
    //mongo db
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
     } 
      else {
       db.collection('shorten-url').find({'url':link}).toArray(function(err,smallResult){
        db.collection('shorten-url').find({}).toArray(function(err,bigResult){
         if (smallResult.length==0){
          urlID=bigResult.length+1;
          json={
            'original':link,
            'shorten-url': 'https://satin-creek.glitch.me/'+urlID}; 
          console.log('1st Connection mongodb sucessfully');
          db.collection('shorten-url').insert({urlId:urlID, url:link}, function(err, result) {
          if (err) throw err;
          console.log('mongodb updated');
          db.close();
          });  
          response.send(json);
         }
         else if (smallResult!=[]){
           json={
            'original':smallResult[0].url,
            'shorten-url': 'https://satin-creek.glitch.me/'+smallResult[0].urlId}
           db.close();
           response.send(json);
         }
       });
      });
     }
    });
  }
});

app.get("/:one", function (request, response) {
  var urlToDirect='http://www.example.com';
  var urlID= parseInt(request.params.one);
  
  MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
     } else {
    console.log('Connection mongodb sucessfully');
    db.collection('shorten-url').find({'urlId':urlID}).toArray(function(err,result){
      urlToDirect=result[0].url;
      console.log(result);
      response.redirect(301, urlToDirect);
    });
        db.close();
     }
});
});
//check url 
function isUrl(s) {
   var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
   return regexp.test(s);
}
// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
