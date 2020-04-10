const express = require('express');
var app = express();
const path = require('path');
const qr = require('qr-image');
const redis = require('redis')
const requestIp = require('request-ip');
const pug = require('pug');
const bodyParser = require('body-parser');
const assert = require('assert')

const env = process.env.NODE_ENV || 'production';
const config = require('./config')[env];

//testing
const mongoose = require('mongoose');
var mongoDB = config.cognito_connection

mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Schema = mongoose.Schema;
//Schema is saved in config.js. there may be a better place to put this
var EmagrqSchema = new Schema(config.cognito_schema, {collection: 'emag-rq'});
var EmagrqModel = mongoose.model('EmagrqModel', EmagrqSchema);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.set('json spaces', 2)

app.use(requestIp.mw())
app.use('/static', express.static(__dirname + '/static'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

//someday I would like to figure out why i am getting so may favicon errors
app.get('/favicon.ico', (req, res) => res.status(204));

//this resets the entire redis database.
//I may build this out more to reset users within specific games
app.get('/reset', function (req, res) {
  var client = redis.createClient(process.env.REDIS_URL)

  client.on("error", function (err) {
      console.log("Error " + err);
  });

  client.flushall(function (err, success){
    res.send('game has been reset');
    console.log('reset sent ...');
  })
});

app.get('/game_builder', function(req, res){
        res.sendFile(path.join(__dirname + '/static/game_builder.html'));
  })

//this is used on the 'home' page to display game examples for people to play
app.get('/', function(req, res){

    var game_fields = {
    };

    EmagrqModel.find({}, game_fields).lean().exec( function(err, game_json) {
    //at some point this will only search the mongoDB for the games marked at public

          if (err) return handleError(err);
          if (game_json) {
            //console.log(game_json);
            res.render('template', {
                //root_route: ['Welcome to emag-rq. This application is currently under development.','Follow the link below to print the codes and start a game','https://emag-rq.herokuapp.com/print'],
                request: null,
                print_url: req.protocol + '://' + req.get('host') + '/print:',
                json_data: game_json
            });
          } else {res.send(JSON.stringify({error : 'Error'}))}
    })
});

app.post('/post-test', (req, res) => {
    console.log('got req', req);
    EmagrqModel.collection.insertOne(req.body, function(err, r){
      assert.equal(null, err);
      assert.equal(r);
      db.close();
    })
    //console.log('Got body:', JSON.stringify(req.body));
    res.sendStatus(200);
});

app.get('/:key', function (req, res) {
  var client = redis.createClient(process.env.REDIS_URL)

  client.on("error", function (err) {
      console.log("Error " + err);
  });

  var key_string = req.params.key.replace(/code:/g,'');
      //make this again later
      //encrypt the url, so people do not cheat the game by entering the database numbers
  var crypt_url = req.protocol + '://' + req.get('host') + '/' + encodeURIComponent(key_string)
  var qr_url = req.protocol + '://' + req.get('host') + '/code:';
  var game_call = ""
  var gameID = ""
  var clueID = ""

  if (req.params.key.slice(0,5) == 'code:') {
    //this section generates qr codes based on whatever text comes after '/code:/
    //example -- http://localhost:8080/code:monkey will create a qr code that contains the text 'monkey'
        var code = qr.image(crypt_url, { type: 'svg' })
        res.type('svg');
        code.pipe(res);
        console.log('crypt_url:' + crypt_url);;

  } else if (req.params.key.slice(0,6) == 'print:'){
    //this section loads game data into the template based on the gameID
    //example -- http://localhost:8080/print:5e83deba80d4820034e653ac
    //will print all the qr codes for the game in that mongodb doc
        gameID = req.params.key.replace(/print:/g,'');
        console.log('gameID in print logic:' + gameID);
        EmagrqModel.findOne({_id:gameID}).lean().exec( function(err, game_json) {
              if (err) return handleError(err);
              if (game_json) {
                  console.log(game_json.qr_codes);
                  res.render('template', {
                      json_data: game_json.qr_codes,
                      request: 'print',
                      qr_code: qr_url,
                      gameID: gameID,
                  });
              } else {res.send(JSON.stringify({error : 'Error'}))}
          })
          console.log('request in print logic:' + req.params.key);
  } else if (req.params.key.slice(0,10) == 'game_call:') {
    //this section loads game data into the template based on the gameID and clueID
    //it splits the data between the underscore '_' to determine which game and which clue are being called
        game_call = req.params.key.replace(/game_call:/g,'').split('_');
        gameID = game_call[0]
        clueID = game_call[1]
        console.log('gameID:' + gameID + ' clueID:' + clueID);
        client.hget(req.clientIp, req.params.key, function(err, usr_pg_view){
            console.log('redis data:');console.dir(usr_pg_view);
            EmagrqModel.findOne({_id:gameID}).lean().exec( function(err, game_json) {
                  if (err) return handleError(err);
                  if (game_json) {
                      console.log(game_json);
                      res.render('template', {
                        qr_code: qr_url,
                        json_data: game_json,
                        previous_view: usr_pg_view,
                        //previous_view: null,
                        request: clueID,
                      });
                  } else {res.send(JSON.stringify({error : 'Error'}))}
              })
        });
        client.hmset(req.clientIp, req.params.key, Date())
  } else {
        res.status(204)
  }
      client.quit()
});


var port = process.env.PORT || 8080;
app.listen(port, function() {
//  console.log('EDOC_RQ is running');
  console.log('EDOC_RQ is running on http://localhost:' + port);
});
