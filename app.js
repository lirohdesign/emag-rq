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


app.get('/:key', function (req, res) {
  var client = redis.createClient(process.env.REDIS_URL)
  var key_string = req.params.key.replace(/code:/g,'')
  var page_url = req.protocol + '://' + req.get('host') + '/' + key_string;
  var qr_url= req.protocol + '://' + req.get('host') + '/code:';

//this section creates QR codes when a code: URL is passed
  if (req.params.key.slice(0,5) == 'code:'){ //may want to consider adding logic here to create codes only if items exist in JSON file

    var code = qr.image(page_url, { type: 'svg' })
    res.type('svg');
    code.pipe(res);

  } else {
//this section creates pages from template.pug based on the URL key
    client.hget(req.clientIp, req.params.key, function(err, usr_pg_view){

        jsonfile.readFile( "data.json", 'utf8', function (err, data) {
          var pg_json_record = {}
            for (var i = 0; i < data.length; i++) {
                if (data[i].key == req.params.key){
                  pg_json_record = data[i]
                };
            };
          res.render('template', {
              qr_code: qr_url,
              json_data: data,
              previous_view: usr_pg_view,
              request: req.params.key,
              pg_json_record: pg_json_record
          });
        });
    });
  }
  //console.log('Cookies: ', req.cookies)
  client.hset(req.clientIp, req.params.key, Date())
  client.quit()
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('EDOC_RQ is running on http://localhost:' + port);
});
