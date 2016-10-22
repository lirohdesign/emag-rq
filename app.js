var express = require('express');
var app = express();
var fs = require("fs");
var jsonfile = require('jsonfile');
var path = require('path');

app.use('/static', express.static(__dirname + '/static'));

app.get('/read_all', function (req, res) {
   jsonfile.readFile( "data.json", 'utf8', function (err, data) {
      res.end( JSON.stringify(data, null, 4) );
      console.log('data sent ...');
    });
});

app.get('/page', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
  console.log('data sent ...');
});

app.get('/print', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/print.html'));
  console.log('data sent ...');
});

app.get('/:key', function (req, res) {
  jsonfile.readFile( "data.json", 'utf8', function (err, data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i]['key'] == req.params.key) {
        res.end(JSON.stringify(data[i].clue, null, 4));
      }
    }
  })
  console.log('data sent...')
});

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("EMAG listening at http://%s:%s", host, port)
})
