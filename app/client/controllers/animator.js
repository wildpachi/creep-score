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