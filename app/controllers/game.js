// Main Driver for the Game

var Creep  = require('../models/creep')
  , Player = require('../models/player');

// Constants

var RED_HEIGHT = 400;
var BLU_HEIGHT = 50;

// CreateFactory

exports.create = function create(socket) {
	new Game(socket);
}

// Constructor

function Game (socket) {
	this.player = null;
	this.creeps  = { red:  creepArray("red",  RED_HEIGHT), 
					 blue: creepArray("blue", BLU_HEIGHT)  };
	this.ready   = false;

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
	}

	if (!self.ready)
		self.socket.on('init_game', onInit);
}

Game.prototype.events = function events() {
	var self = this;

	var handlers = {
		onMouseClick: function (data) {
			for (var team in self.creeps) {
				for (var unit in self.creeps[team]) {
					var c = self.creeps[team][unit];
					if (c.didHit(data.x, data.y)) {
						c.doHit(self.player.getDamage());
						self.socket.emit('hit_confirm', {team: team, unit: unit, life: c.getLife()})
					}
				}
			}
		}
	};	

	self.socket.emit('new_game', self.getState());
	self.socket.on('mouse_click', handlers.onMouseClick);
};

// Business

Game.prototype.getState = function () { 
	var state = { creeps: {red: [], blue: []} };
	for (var team in this.creeps)
		for (var unit in this.creeps.red)
			state.creeps[team].push(this.creeps[team][unit].getState())

	return state;
}

Game.prototype.hitMinion = function (team, unit) {
	var self = this;
	var creep = self.creeps[team][unit];

	creep.hit(5);
	if (creep.getLife() <= 0)
		self.emit('death', { team: team, unit: unit } );
}

// Other functions

function creepArray (team, y) {
	var array = [];

	for (var i = 0; i < 5; i++)
		array[i] = Creep.create(team, 25 + (i * 60), y);

	return array;
}