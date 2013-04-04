;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0](function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
// Driver for the client side of the game

var anim  = require('../view/animation')
  , Creep = require('../../models/creep');

exports.create = create;

function create () {
	var game = new Game();
}

/**
 *  Initialisation
 */

function Game () {
	this.board   = $('div#gameboard');
	this.socket  = io.connect();
	this.canvas  = document.getElementById('canvas');
	this.ctx     = this.canvas.getContext("2d");
	this.drawObj = [];

	this.socket.emit('init_game', {
		damage:  45,
		startup: 35,
		recovery: 5
	});

	this.eventHandlers();
	this.animate();
}

Game.prototype.init_state = function (state) {
	$.each(state.creeps.blue, function (i,v) {
		game.drawObj.push(Creep.create(v.x, v.y));
	})
	$.each(state.creeps.red, function (i,v) {
		game.drawObj.push(Creep.create(v.x, v.y));
	})
};

/*
**  Event Handlers
*/

Game.prototype.events = function () {
	var self = this;
	var handlers = {
		new_state: function (data) {
			self.init_state(data);
		},

		hit_confirm: function (data) {
			var creep = self.drawObj[data.unitid];
			creep.setHealth(data.life);
			console.log("Hit!");
		}
	}

	this.socket.on('new_game',    self.events.new_state);
	this.socket.on('hit_confirm', self.events.hit_confirm);

	$(canvas).click( function (e) {
		var date = new Date(); 
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
};
},{"../view/animation":2,"../../models/creep":3}],2:[function(require,module,exports){
// Animation function with fallbacks

exports.requestAnimFrame = function() {
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
};

// shim layer with setTimeout fallback
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
},{}],3:[function(require,module,exports){
// Creep Object

var CREEP_WIDTH  = 50;
var CREEP_HEIGHT = 43;
var MAX_LIFE     = 280;

function create(x,y,w,h,l) {
	w = (typeof w === "undefined") ? CREEP_WIDTH : w;
	h = (typeof h === "undefined") ? CREEP_WIDTH : h;
	l = (typeof l === "undefined") ? CREEP_WIDTH : l;

	return new Creep(x,y,w,h,l);
}

function Creep (x,y,w,h,l) {
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

	var life = stats.max_life;

	return {
		getState: function () {
			return { x: display.x, y: display.y, 
					 w: display.w, h: display.h,
					 life: life,
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
		},

		setHeath: function (life) {
			this.life = life;
		}
	}
}

exports.create = create;
},{}]},{},[1])
;