// Game server init

var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http);

var server_port = 8080;
var server_ip_address = '127.0.0.1';

var GameController = require('./scripts/gameController.js')

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

http.listen(server_port, server_ip_address, function() {
  console.log("Game Listening on " + server_ip_address + ", port " + server_port);
});

var gameController = new GameController(io);
gameController.init();

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});

io.on('connection', function (socket) {
    console.log('message was sent');
    socket.on('chat message', function (msg) {
        console.log('message was sent '+msg);
        io.emit('chat message', msg);
    });
});
