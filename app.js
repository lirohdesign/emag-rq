var express = require('express');
var app = express();
var jsonfile = require('jsonfile');
var path = require('path');
var qr = require('qr-image');
var redis = require('redis')
var requestIp = require('request-ip');
var pug = require('pug');

var env = process.env.NODE_ENV || 'production';
var config = require('./config')[env];

//testing
var mongoose = require('mongoose');
var mongoDB = 'mongodb://integromatconnection:Th3M0nst3r@ds263448.mlab.com:63448/heroku_5wv92jfn'
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
//Get the default connection
//https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose great
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Schema = mongoose.Schema;
var EmagrqSchema = new Schema({
      _id: String,
      game_id: String,
      date_created: Date,
      game_name: String,
      password: String,
      user_name: String,
      description_for_start: Array,
      start_location: String,
      game_data: Array
    }, {
        collection: 'emag-rq'
    });
var EmagrqModel = mongoose.model('EmagrqModel', EmagrqSchema);





//encrypt the url, so people do not cheat the game by entering the database numbers
//make this again later


app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.set('json spaces', 2)
//what is the difference between app.set and app.use
//what is the difference between let, cont, and var

app.use(requestIp.mw())
app.use('/static', express.static(__dirname + '/static'));
app.use(express.json());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, accept');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/reset', function (req, res) {
  var client = redis.createClient(process.env.REDIS_URL)
  client.flushall(function (err, success){
    res.send('game has been reset');
    console.log('reset sent ...');
  })
});

app.get('/horse', function(req, res){
  var game_fields = {
      __v: 0,
      _id: 0
  };

  EmagrqModel.find({}, game_fields, function(err, game_json) {

        if (err) return handleError(err);
        if (game_json) {
            res.send(game_json)
        } else {res.send(JSON.stringify({error : 'Error'}))}
    })

});

app.get('/', function(req, res){
    var game_fields = {
        __v: 0,
        _id: 0
    };

    EmagrqModel.find({}, game_fields, function(err, game_json) {
          if (err) return handleError(err);
          if (game_json) {
            res.render('template', {
                //root_route: ['Welcome to emag-rq. This application is currently under development.','Follow the link below to print the codes and start a game','https://emag-rq.herokuapp.com/print'],
                request: null,
                print_url: req.protocol + '://' + req.get('host') + '/print:',
                json_data: game_json  ,
            });
          } else {res.send(JSON.stringify({error : 'Error'}))}
    })
});
//
//const bodyParser = require('body-parser');
//var assert = require('assert')
//app.use(bodyParser.urlencoded({ extended: true }));

//app.post('/post-test', (req, res) => {
//    EmagrqModel.collection.insert(req.body, function(err, r){
//      assert.equal(null, err);
//      assert.equal(r);
//      db.close();
//    })
//    console.log('Got body:', req.body);
//    res.sendStatus(200);
//});





app.get('/:key', function (req, res) {
  var client = redis.createClient(process.env.REDIS_URL)
  var key_string = req.params.key.replace(/code:/g,'');
  var crypt_url = req.protocol + '://' + req.get('host') + '/' + encodeURIComponent(key_string)//simpleCrypto.encrypt(encode_key_string);
  var qr_url = req.protocol + '://' + req.get('host') + '/code:';
  var game_call = ""
  var gameID = ""
  var clueID = ""

  if (req.params.key.slice(0,5) == 'code:') {

        var code = qr.image(crypt_url, { type: 'svg' })
        res.type('svg');
        code.pipe(res);
        console.log('crypt_url:' + crypt_url);;

  } else if (req.params.key.slice(0,6) == 'print:'){
        gameID = req.params.key.replace(/print:/g,'');
        console.log('gameID in print logic:' + gameID);
        EmagrqModel.findOne({game_id:gameID}, function(err, game_json) {
              if (err) return handleError(err);
              if (game_json) {
                  res.render('template', {
                      json_data: game_json.game_data,
                      request: 'print',
                      qr_code: qr_url,
                      gameID: gameID,
                  });
              } else {res.send(JSON.stringify({error : 'Error'}))}
          })
          console.log('request in print logic:' + req.params.key);
  } else if (req.params.key.slice(0,10) == 'game_call:') {
        game_call = req.params.key.replace(/game_call:/g,'').split('_');
        gameID = game_call[0]
        clueID = game_call[1]
        console.log('gameID:' + gameID + ' clueID:' + clueID);

        //this section creates pages from template.pug based on the URL key
        client.hgetall(req.clientIp, req.params.key, function(err, usr_pg_view){
            console.dir('redis data log:' + usr_pg_view);
            EmagrqModel.findOne({game_id:gameID}, function(err, game_json) {
                  if (err) return handleError(err);
                  if (game_json) {
                      res.render('template', {
                        qr_code: qr_url,
                        json_data: game_json.game_data,
                        previous_view: usr_pg_view,
                        //previous_view: null,
                        request: clueID,
                      });
                  } else {res.send(JSON.stringify({error : 'Error'}))}
              })
        });
        console.log(req.params.key);
        client.hmset(req.clientIp, req.params.key, Date())
  } else {
        res.status(204)
  }
      client.quit()
});


var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('EDOC_RQ is running');
//  console.log('EDOC_RQ is running on http://localhost:' + port);
});
