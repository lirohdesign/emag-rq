var express = require('express');
var app = express();
var fs = require("fs");
var jsonfile = require('jsonfile');
var path = require('path');
var qr = require('qr-image');
var ip = require('ip')
var cookieSession = require('cookie-session')
var cookieParser = require('cookie-parser')
var redis = require('redis')
var requestIp = require('request-ip');
var endOfLine = require('os').EOL;
var pug = require('pug');

var urlCrypt = require('url-crypt')('w$^DhPeB$Hu&*t3xT87KdBjVaNzKE%NGYw7sPxRdWFp4');

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//what is the difference between app.set and app.use
//what is the difference between let, cont, and var

app.use(requestIp.mw())
app.use(cookieParser())
app.use(cookieSession({secret: '1234567890QWERTY'}))
//i may not actually be using any cookies
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

app.get('/reset', function (req, res) {
  var client = redis.createClient(process.env.REDIS_URL)
  client.flushall(function (err, success){
    res.send('game has been reset');
    console.log('reset sent ...');
  })
});

app.get('/', function(req, res){
  res.render('template', {
      root_route: ['Welcome to emag-rq. This application is currently under development.','Follow the link below to print the codes and start the game','https://emag-rq.herokuapp.com/print']
  });
});

app.get('/print', function(req, res){
  jsonfile.readFile( "data.json", 'utf8', function (err, data) {
    res.render('template', {
        json_data: data
    });
  });
});


app.get('/goat', function(req, res){
  jsonfile.readFile( "data.json", 'utf8', function (err, data) {
        var base64 = urlCrypt.cryptObj(data[0].game_data.key)
        var page_url = req.protocol + '://' + req.get('host') + '/' + data[0].game_data.key;
        console.log(page_url);
        var crypt_url = req.protocol + '://' + req.get('host') + '/' + base64;
        var code = qr.image(crypt_url, { type: 'svg' })
        res.type('svg');
        code.pipe(res);
        console.log(crypt_url);
      });
    });

app.get('/:key', function (req, res) {
  var client = redis.createClient(process.env.REDIS_URL)

  var key_string = req.params.key.replace(/code:/g,'');
  var crypt_url = req.protocol + '://' + req.get('host') + '/' + urlCrypt.cryptObj(key_string);
  var qr_url= req.protocol + '://' + req.get('host') + '/code:';


if (req.params.key.slice(0,5) == 'code:') {
  //this section creates QR codes when a code: URL is passed
   //may want to consider adding logic here to create codes only if items exist in JSON file

      var code = qr.image(crypt_url, { type: 'svg' })
      res.type('svg');
      code.pipe(res);
      console.log(crypt_url);;

  } else {

    data_key = urlCrypt.decryptObj(req.params.key)
    //this section creates pages from template.pug based on the URL key
        client.hget(req.clientIp, data_key, function(err, usr_pg_view){
            console.log(usr_pg_view);
            jsonfile.readFile( "data.json", 'utf8', function (err, data) {
              var pg_json_record = {}
                for (var i = 0; i < data[0].game_data.length; i++) {
                    if (data[0].game_data[i].key == data_key){
                      pg_json_record = data[0].game_data[i];
                    };
                };
              res.render('template', {
                  qr_code: qr_url,
                  json_data: data[0].game_data,
                  previous_view: usr_pg_view,
                  request: data_key,
                  pg_json_record: pg_json_record
              });
            });
        });

    console.log(data_key);
    client.hset(req.clientIp, data_key, Date())

  }
  client.quit()
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('EDOC_RQ is running on http://localhost:' + port);
});
