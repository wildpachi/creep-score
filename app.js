// Launches HTTP server and Websocket listener

var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server, {'log level': 2})
  , game = require('./app/controllers/game');

var port = process.env.PORT || 8000;

app.configure(function(){
    app.use(express.static(__dirname + '/public'));
});

server.listen(port);

io.sockets.on('connection', function (socket) {
	game.create(socket);
});
