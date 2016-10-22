var express = require('express');
var app = express();
var fs = require("fs");
var jsonfile = require('jsonfile');
var path = require('path');
var qr = require('qr-image');
var ip = require('ip')

app.use('/static', express.static(__dirname + '/static'));
console.log(express.static(__dirname + '/static');

app.get('/read_all', function (req, res) {
   jsonfile.readFile( "data.json", 'utf8', function (err, data) {
      res.end( JSON.stringify(data, null, 4) );
      console.log('read_all sent ...');
    });
});

app.get('/page', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
  console.log('page sent ...');
});

app.get('/print', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/print.html'));
  console.log('print sent ...');
});

//app.get('/:key', function (req, res) {
//  jsonfile.readFile( "data.json", 'utf8', function (err, data) {
//    for (var i = 0; i < data.length; i++) {
//      if (data[i]['key'] == req.params.key) {
//        res.end(JSON.stringify(data[i].clue, null, 4));
//        console.log('key sent ...');
//      }
//    }
//  })
//  console.log('data sent...')
//});

app.get('/:key', function (req, res) {
  if (req.params.key.slice(0,5) == 'code:'){
    console.log(req.params.key.slice(0,5));
    var full_pth = 'http://' + ip.address() + ':' + port + '/' + req.params.key //fix this point here
    console.log(full_pth);
    var code = qr.image(full_pth, { type: 'svg' })
    res.type('svg');
    code.pipe(res);
  }
  else {
    jsonfile.readFile( "data.json", 'utf8', function (err, data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i]['key'] == req.params.key) {
          res.end(JSON.stringify(data[i].clue, null, 4));
          console.log('key sent ...');
        }
      }
    });

  }
});



var port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
