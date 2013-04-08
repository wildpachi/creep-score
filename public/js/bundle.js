;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0](function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
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
},{"../view/requestAnimFrame":2,"./animator":3,"../../models/creep":4}],2:[function(require,module,exports){
// Animation function with fallbacks

exports.requestAnimFrame = function (f) {
	return requestAnimFrame(f);
}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

// shim layer with setTimeout fallback
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
},{}],4:[function(require,module,exports){
// Creep Object (Used by both server + client code)

var CREEP_WIDTH  = 50;
var CREEP_HEIGHT = 43;
var MAX_LIFE     = 295;

function create(team,x,y,w,h,l) {
	w = (typeof w === "undefined") ? CREEP_WIDTH : w;
	h = (typeof h === "undefined") ? CREEP_HEIGHT: h;
	l = (typeof l === "undefined") ? MAX_LIFE : l;

	return new Creep(team,x,y,w,h,l);
}

function Creep (team,x,y,w,h,l) {
	var display = { 
		x: x, 
		y: y,
		w: w,
		h: h 
	};
	
	var stats = {
		max_life: l,
		attack:   25,
		cooldown: 40,
		revive:   30*60			  
	};

	var flags = {
		draw: true,
		dead: false
	}

	var life = stats.max_life;
	var team = team;

	return {
		getState: function () {
			return { x: display.x, y: display.y, 
					 w: display.w, h: display.h,
					 life: life, team: team,
					 max_life: stats.max_life };
		},

		getLife: function () {
			return life;
		},

		didHit: function (x1,y1) {
			var c = display;
			return (x1 >= c.x)
				&& (x1 <= c.x+c.w)
				&& (y1 >= c.y)
				&& (y1 <= c.y+c.h);
		},

		doHit: function (dmg) {
			life -= dmg;
			flags.dead = (life <= 0);
		},

		setLife: function (newlife) {
			life = newlife;
			flags.dead = (life <= 0);
			if (flags.dead)
				flags.draw = true;
		},

		revive: function () {
			life = stats.max_life;
			flags.dead = false;
		},

		getFlag: function (flag) {
			return flags[flag];
		},

		toggleFlag: function (flag) {
			flags[flag] = !flags[flag];
		}
	}
}

exports.create = create;
},{}],3:[function(require,module,exports){
// Animation Controller

var CreepDraw = require('../view/creepDraw');

function animate(players, creeps) {
	for (var team in creeps) {
		for (var unit in creeps[team]) {
			var creep = creeps[team][unit];
			CreepDraw.animate(creep);
		}
	}
}

exports.animate = animate;
},{"../view/creepDraw":5}],5:[function(require,module,exports){
// View related extension of the Server Creep Object

var canvas  = document.getElementById('canvas');
var ctx     = canvas.getContext("2d");

function drawSprite (creep) {
	ctx.clearRect(creep.x-2, creep.y-2, creep.w+5, creep.h+5);

	ctx.beginPath();
	ctx.moveTo(creep.x, creep.y + creep.h);
	ctx.lineTo(creep.x + creep.w, creep.y + creep.h);
	ctx.lineTo(creep.x + (creep.w/2), creep.y);
	ctx.lineTo(creep.x, creep.y + creep.h);
	
	ctx.fillStyle = creep.team;
	ctx.stroke();
	ctx.fill();
	ctx.closePath();
};

function drawDeath (creep) {
	var x = creep.x + (creep.w/2);
	
	ctx.clearRect(creep.x-2, creep.y-2, creep.w+5, creep.h+5);
	
	ctx.beginPath();
	ctx.moveTo(x-5,  creep.y);
	ctx.lineTo(x+4,  creep.y);
	ctx.lineTo(x+3,  creep.y+28);
	ctx.lineTo(x-3,  creep.y+28);
	
	ctx.rect(x-2, creep.y+32, 6, 6);

	ctx.fillStyle = creep.team;
	ctx.stroke();
	ctx.fill();
	ctx.closePath();
};

function drawHealth (creep) {
	var dim   = { height: 5, width: 40 };
	var width = Math.max(0,(dim.width * creep.life / creep.max_life));
	
	var x = creep.x + 5;
	var y = creep.y - 15;
	
	ctx.clearRect(x, y, dim.width, dim.height);
	
	ctx.beginPath();
	ctx.rect(x, y, width, dim.height);
	ctx.fillStyle = "green";
	ctx.fill();
	ctx.closePath();

	ctx.beginPath();
	ctx.rect(x, y, dim.width, dim.height);
	ctx.strokeStyle = "black";
	ctx.stroke();
	ctx.closePath();
};

exports.animate = function animate (creep) {
	if (creep.getFlag("dead")) {
		drawDeath(creep.getState());
	} else if (creep.getFlag("draw")) {
		drawSprite(creep.getState());
		creep.toggleFlag("draw");
	}

	drawHealth(creep.getState());
}

},{}]},{},[1])
;