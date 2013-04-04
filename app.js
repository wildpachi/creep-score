// Launches HTTP server and Websocket listener

var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server, {'log level': 2})
  , game = require('./app/controllers/game');

app.configure(function(){
    app.use(express.static(__dirname + '/public'));
});

server.listen(8000);

io.sockets.on('connection', function (socket) {
	game.create(socket);
});
