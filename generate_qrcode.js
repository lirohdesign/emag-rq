var qr = require('qr-image');
var express = require('express');
var app = express();
var ip = require('ip')


app.get('/:key', function (req, res) {
  var full_pth = 'http://' + ip.address() + ':' + port + '/' + req.params.key
  var code = qr.image(full_pth, { type: 'svg' })
  res.type('svg');
  code.pipe(res);
});

//var server = app.listen(3000, function () {
//   var host = server.address().address
//   var port = server.address().port
//   console.log("EDOC RQ listening at http://%s:%s", host, port)
//})

var port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('Generate QR Codes is running on http://localhost:' + port);
});
