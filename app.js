var express = require('express');
var app = express();
var jsonfile = require('jsonfile');
var path = require('path');
var qr = require('qr-image');
var redis = require('redis')
var requestIp = require('request-ip');
var pug = require('pug');

//config.js link
var env = process.env.NODE_ENV || 'production';
var config = require('./config')[env];

//encrypt the url, so people do not cheat the game by entering the database numbers
//make this again later


app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//what is the difference between app.set and app.use
//what is the difference between let, cont, and var

app.use(requestIp.mw())
app.use('/static', express.static(__dirname + '/static'));

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

app.get('/', function(req, res){
  jsonfile.readFile( "data.json", 'utf8', function (err, data) {
    res.render('template', {
        root_route: ['Welcome to emag-rq. This application is currently under development.','Follow the link below to print the codes and start a game','https://emag-rq.herokuapp.com/print'],
        request: null,
        print_url: req.protocol + '://' + req.get('host') + '/print:',
        json_data: data,
    });
  });
});
//app.get  goat goes here if I ever decide to keep debugging it.

app.get('/:key', function (req, res) {
  var client = redis.createClient(process.env.REDIS_URL)
  var key_string = req.params.key.replace(/code:/g,'');
  var crypt_url = req.protocol + '://' + req.get('host') + '/' + encodeURIComponent(key_string)//simpleCrypto.encrypt(encode_key_string);
  var qr_url = req.protocol + '://' + req.get('host') + '/code:';
  var game_call = ""
  var gameID = ""
  var clueID = ""

  if (req.params.key.slice(0,5) == 'code:') {
    //this section creates QR codes when a code: URL is passed
     //may want to consider adding logic here to create codes only if items exist in JSON file

        var code = qr.image(crypt_url, { type: 'svg' })
        res.type('svg');
        code.pipe(res);
        console.log('crypt_url:' + crypt_url);;

  } else if (req.params.key.slice(0,6) == 'print:'){
        gameID = req.params.key.replace(/print:/g,'');
        console.log('gameID in print logic:' + gameID);
        jsonfile.readFile( "data.json", 'utf8', function (err, data) {
            for(var h = 0; h < data.length; h++){
              console.log(data[h].game_id);
              if (data[h].game_id == gameID){
                gameID = h
              }
            };
            res.render('template', {
                json_data: data[gameID].game_data,
                request: 'print',
                qr_code: qr_url,
                gameID: gameID,
            });
        });
          console.log('request in print logic:' + req.params.key);
  } else if (req.params.key.slice(0,10) == 'game_call:') {
        game_call = req.params.key.replace(/game_call:/g,'').split('_');
        gameID = game_call[0]
        clueID = game_call[1]
        console.log('gameID:' + gameID + ' clueID:' + clueID);

        //this section creates pages from template.pug based on the URL key
        client.hgetall(req.clientIp, req.params.key, function(err, usr_pg_view){
            console.dir('redis data log:' + usr_pg_view);
            jsonfile.readFile( "data.json", 'utf8', function (err, data) {
                for(var h = 0; h < data.length; h++){
                  console.log(data[h].game_id);
                  if (data[h].game_id == gameID){
                    for (var i = 0; i < data[h].game_data.length; i++) {
                        if (data[h].game_data[i].key == clueID){
                          gameID = h
                        };
                    }
                  }
                };
              res.render('template', {
                  qr_code: qr_url,
                  json_data: data[gameID].game_data,
                  previous_view: usr_pg_view,
                  //previous_view: null,
                  request: clueID,
              });
            });
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
