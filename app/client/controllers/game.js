// Driver for the client side of the game
var anim = require('../view/requestAnimFrame')
  , Animator = require('./animator')
  , Creep = require('../../models/creep');

/*
** Constructor
*/

function Game () {
	this.canvas  = document.getElementById('canvas');
	this.ctx     = this.canvas.getContext("2d");

	this.creeps = { red: [], blue: [] };

	this.socket  = io.connect();
}

Game.prototype.begin = function () {
	game.events();
}

/**
 *  Initialisation
 */

Game.prototype.initCreeps = function (creeps) {
	for (var team in creeps) {
		for (var unit in creeps[team]) {
			var creep = creeps[team][unit];
			this.creeps[team].push(Creep.create(team, creep.x, creep.y));
		}
	}
};

/*
**  Event Handlers
*/

Game.prototype.events = function () {
	var self = this;
	var handlers = {
		new_game: function (data) {
			self.initCreeps(data.creeps);
			game.animate();
		},

		hit_confirm: function (data) {
			var target = game.creeps[data.team][data.unit];
			target.setLife(data.life);
		}
	}

	this.socket.emit('init_game', {
		damage:  45,
		startup: 35,
		recovery: 5
	});

	this.socket.on('new_game',    handlers.new_game);
	this.socket.on('hit_confirm', handlers.hit_confirm);

	$(this.canvas).click( function (e) {
		game.socket.emit('mouse_click', {
			x: e.pageX - $(canvas).position().left,
			y: e.pageY - $(canvas).position().top
		});
	});
};

/*
**  Animation / Updates
*/

Game.prototype.animate = function () {
	anim.requestAnimFrame( game.animate );
	Animator.animate([], game.creeps);
};

// Driver
var game = new Game();
game.begin();