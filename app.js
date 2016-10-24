var express = require('express');
var app = express();
var fs = require("fs");
var jsonfile = require('jsonfile');
var path = require('path');
var qr = require('qr-image');
var ip = require('ip')

app.use('/static', express.static(__dirname + '/static'));//try to figure out what is going on with the static links

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

app.get('/:key', function (req, res) {

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
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('EDOC_RQ is running on http://localhost:' + port);
});
