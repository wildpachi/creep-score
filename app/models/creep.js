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
		},

		setLife: function (newlife) {
			life = newlife;
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