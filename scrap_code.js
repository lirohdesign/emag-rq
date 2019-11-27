//react attempt
var http = require("http");
var socketIo = require("socket.io");
var axios = require("axios");
var port = process.env.PORT || 4001;
var index = require("./routes/index.js");
app.use(index);
var server = http.createServer(app);
var io = socketIo(server); // < Interesting!
//var getApiAndEmit = async socket => {
//  try {
//    const res = await axios.get(
//      "https://api.darksky.net/forecast/2947b6a443bbf214667bfe5694d6e4da/43.7695,11.2558"
//    ); // Getting the data from DarkSky
//    socket.emit("FromAPI", res.data.currently.temperature); // Emitting a new message. It will be consumed by the client
//  } catch (error) {
//    console.error(`Error: ${error.code}`);
//  }
//};

app.get('/goat', function(req, res){
  io.on('connect', onConnect);
  function onConnect(socket){
    // sending to the client
    socket.emit('hello', 'can you hear me?', 1, 2, 'abc');
    // sending to all clients except sender
    socket.broadcast.emit('broadcast', 'hello friends!');
    // sending to all clients in 'game' room except sender
    socket.to('game').emit('nice game', "let's play a game");
    // sending to all clients in 'game1' and/or in 'game2' room, except sender
    socket.to('game1').to('game2').emit('nice game', "let's play a game (too)");
    // sending to all clients in 'game' room, including sender
    io.in('game').emit('big-announcement', 'the game will start soon');
    // sending to all clients in namespace 'myNamespace', including sender
    io.of('myNamespace').emit('bigger-announcement', 'the tournament will start soon');
    // sending to a specific room in a specific namespace, including sender
    io.of('myNamespace').to('room').emit('event', 'message');
    // sending to individual socketid (private message)
    io.to(`${socketId}`).emit('hey', 'I just met you');
    // WARNING: `socket.to(socket.id).emit()` will NOT work, as it will send to everyone in the room
    // named `socket.id` but the sender. Please use the classic `socket.emit()` instead.
    // sending with acknowledgement
    socket.emit('question', 'do you think so?', function (answer) {});
    // sending without compression
    socket.compress(false).emit('uncompressed', "that's rough");
    // sending a message that might be dropped if the client is not ready to receive messages
    socket.volatile.emit('maybe', 'do you really need it?');
    // specifying whether the data to send has binary data
    socket.binary(false).emit('what', 'I have no binaries!');
    // sending to all clients on this node (when using multiple nodes)
    io.local.emit('hi', 'my lovely babies');
    // sending to all connected clients
    io.emit('an event sent to all connected clients');
    };
  });

      server.listen(port, () => console.log(`Listening on port ${port}`));

        //react attempt



        //switching out simpleCrypto because it is not reliable


      app.get('/:key', function (req, res) {
        var client = redis.createClient(process.env.REDIS_URL)
        var key_string = req.params.key.replace(/code:/g,'');
        var encode_key_string = encodeURIComponent(key_string)
        var crypt_url = req.protocol + '://' + req.get('host') + '/' + simpleCrypto.encrypt(encode_key_string);
        var qr_url= req.protocol + '://' + req.get('host') + '/code:';
        var data_key = ""

      if (req.params.key.slice(0,5) == 'code:') {
        //this section creates QR codes when a code: URL is passed
         //may want to consider adding logic here to create codes only if items exist in JSON file

            var code = qr.image(crypt_url, { type: 'svg' })
            res.type('svg');
            code.pipe(res);
            console.log(crypt_url);;

        } else {

          if (req.params.key == 'print'){
            data_key = req.params.key;
          } else {
            data_key = simpleCrypto.decrypt(decodeURIComponent(req.params.key))
          }
