var express = require('express');
var app = express();
var fs = require("fs");
var jsonfile = require('jsonfile');
var path = require('path');
var qr = require('qr-image');
var ip = require('ip')
var cookieSession = require('cookie-session')
var cookieParser = require('cookie-parser')


app.use(cookieParser())
app.use(cookieSession({secret: '1234567890QWERTY'}))
app.use('/static', express.static(__dirname + '/static'));//try to figure out what is going on with the static links

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

app.get('/read_all', function (req, res) {
  req.session.lastPage = '/read_all'
  if(req.session.lastPage) {
    console.log('Most recent request was: ' + req.session.lastPage + '. ');
  }
  jsonfile.readFile( "data.json", 'utf8', function (err, data) {
    //res.write( JSON.stringify(data, null, 4) );
    res.json(data);
    console.log('read_all sent ...');
    //console.log('Cookies: ', req.cookies)
  });
});

app.get('/page', function (req, res) {
  req.session.lastPage = '/page'
  if(req.session.lastPage) {
    console.log('Most recent request was: ' + req.session.lastPage + '. ');
  }
  res.sendFile(path.join(__dirname + '/index.html'));
  console.log('page sent ...');
  //console.log('Cookies: ', req.cookies)
});

app.get('/print', function (req, res) {
  req.session.lastPage = '/print'
  if(req.session.lastPage) {
    console.log('Most recent request was: ' + req.session.lastPage + '. ');
  }
  res.sendFile(path.join(__dirname + '/pages/print.html'));
  console.log('print sent ...');
  //console.log('Cookies: ', req.cookies)
});

app.get('/:key', function (req, res) {
  req.session.lastPage = req.params.key
  if(req.session.lastPage) {
    console.log('Most recent request was: ' + req.session.lastPage + '. ');
   }
  if (req.params.key.slice(0,5) == 'code:'){
    var code_text;
    var key_string = req.params.key.replace(/code:/g,'')
    var data = jsonfile.readFileSync( "data.json", 'utf8')
    for (var i = 0; i < data.length; i++) {
      if (data[i].key === key_string) {
        code_text = req.protocol + '://' + req.get('host') + '/' + key_string;
        break;
      } else {
        code_text = key_string
      }
    };
    var code = qr.image(code_text, { type: 'svg' })
    res.type('svg');
    code.pipe(res);
    } else {
      jsonfile.readFile( "data.json", 'utf8', function (err, data) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].key == req.params.key) {
            res.send(JSON.stringify(data[i].clue, null, 4));
          }
        };
      });
    }
  //console.log('Cookies: ', req.cookies)
});

var port = process.env.PORT || 8080;

app.listen(port, function() {
  console.log('EDOC_RQ is running on http://localhost:' + port);
});
