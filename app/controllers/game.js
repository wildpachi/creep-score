// Main Driver for the Game

var Creep  = require('../models/creep'),
    Player = require('../models/player'),
    Clock  = require('../models/clock');

// Constants

var RED_HEIGHT = 400;
var BLU_HEIGHT = 50;

// CreateFactory

exports.create = function create(socket) {
	new Game(socket);
};

// Constructor

function Game (socket) {
	this.player = null;
	this.creeps  = { red:  creepArray("red",  RED_HEIGHT), 
					blue: creepArray("blue", BLU_HEIGHT)  };
	this.ready   = false;

	this.clock = new Clock();

	this.socket  = socket;
	this.warmup();
}

// Events

Game.prototype.warmup = function warmup () {
	var self = this;

	var onInit = function onInit (data) {
		self.ready = true;
		self.player = Player.create(data.damage, data.startup, data.recovery);
		self.events();
		self.clock.start();
	};

	if (!self.ready) {
		self.socket.on('init_game', onInit);
	}
};

Game.prototype.events = function events() {
	var self = this;

	var handlers = {
		onMouseClick: function (data) {
			for (var team in self.creeps) {
				for (var unit in self.creeps[team]) {
					var c = self.creeps[team][unit];
					if (c.didHit(data.x, data.y)) {
						self.clock.add(self.player.getStartup(), 'hit', { team: team, unit: unit, creep: c, dmg: self.player.getDamage()});
					}
				}
			}
		}
	};	

	self.socket.emit('new_game', self.getState());
	self.socket.on('mouse_click', handlers.onMouseClick);
	self.clock.on('hit', function(data) {
		data.creep.setLife(data.creep.getLife() - data.dmg);
		self.socket.emit('hit_confirm', {team: data.team, unit:data.unit, life:data.creep.getLife()});

		if (data.creep.getFlag("dead")) { 
			self.player.incScore();
			self.clock.add(data.creep.getStats("revive"), 'revive', data);
			self.socket.emit('player_score', {score: self.player.getScore()});
		}
	});


	self.clock.on('revive', function(data) {
		data.creep.revive();
		self.socket.emit('hit_confirm', {team: data.team, unit:data.unit, life:data.creep.getLife()});
	});
};

// Business

Game.prototype.getState = function () { 
	var state = { creeps: {red: [], blue: []} };
	for (var team in this.creeps) {
		for (var unit in this.creeps.red) {
			state.creeps[team].push(this.creeps[team][unit].getState());
		}
	}

	return state;
};

Game.prototype.hitMinion = function (team, unit) {
	var self = this;
	var creep = self.creeps[team][unit];

	creep.hit(5);
	if (creep.getLife() <= 0) {
		self.emit('death', { team: team, unit: unit } );
	}
};

// Other functions

function creepArray (team, y) {
	var array = [];

	for (var i = 0; i < 5; i++) {
		array[i] = Creep.create(team, 25 + (i * 60), y);
	}

	return array;
}


