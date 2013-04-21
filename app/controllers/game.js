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
		self.clock.start();
		self.events();
		self.timers();
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

	self.socket.on('mouse_click', handlers.onMouseClick);	

	self.socket.emit('new_game', self.getState());
};

Game.prototype.timers = function timers() {
	var self = this;

	var timers = {
		sync: function (data) {
			self.socket.emit('sync_scoreboard', {time: self.clock.getRealTime(), score: self.player.getScore()});
			self.clock.add(1000, 'sync', {});
		},
	
		autoattack: function (data) {
			var source = data.creep;
			var ateam  = data.ateam;

			var target = source.getTarget();

			if ((target == null) || (self.creeps[ateam][target]).getFlag("dead")) {
				target = getNewTarget(self.creeps[ateam]);
			}

			if (target != null) {
				source.setTarget(target);
				var creep = self.creeps[ateam][target];

				creep.setLife(creep.getLife() - source.getStats("attack"));
				self.socket.emit('hit_confirm', {team: ateam, unit: target, life: creep.getLife()});

				if (creep.getFlag("dead")) {
					self.clock.add(creep.getStats("revive"), 'revive', 
						{creep: creep, team: ateam, unit: target, life: creep.getLife()});
				}
			}

			self.clock.add(source.getStats("cooldown"), 'creep_atk', data);
		},

		hit: function(data) {
			var was_alive = !data.creep.getFlag("dead");
			data.creep.setLife(data.creep.getLife() - data.dmg);
			self.socket.emit('hit_confirm', {team: data.team, unit:data.unit, life:data.creep.getLife()});

			if (was_alive && data.creep.getFlag("dead")) { 
				self.player.incScore(data.team);
				self.clock.add(data.creep.getStats("revive"), 'revive', data);
			}
		},

		revive: function (data) {
			data.creep.revive();
			self.socket.emit('hit_confirm', {team: data.team, unit:data.unit, life:data.creep.getLife()});
		}

	};

	self.clock.on('hit', timers.hit);
	self.clock.on('revive', timers.revive);

	self.clock.on('sync', timers.sync);
	self.clock.on('creep_atk', timers.autoattack);

	timers.sync();

	for (team in self.creeps) {
		for (unit in self.creeps[team]) {
			var c = self.creeps[team][unit];
			var t = (team == "red" ? "red" : "blue");

			timers.autoattack( { creep: c, ateam: t });
		}
	}
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

function getNewTarget (creeps) {
	var alive = [];
	for (id in creeps) {
		if (!creeps[id].getFlag("dead"))
			alive.push(id);
	}

	if (alive.length == 0)
		return null;

	return alive[Math.floor(Math.random() * alive.length)];
}

