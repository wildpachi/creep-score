// Player Object

function create (damage, startup, recovery) {
    return new Player(damage, startup, recovery);
}

function Player (damage, startup, recovery) {
	var dmg = damage
      , sup = startup
      , rec = recovery;

    var score = 0;

    return {
    	getDamage: function () {
    		return dmg;
    	},

    	getStartup: function () {
    		return startup;
    	},

    	getScore: function () {
    		return score;
    	},

    	incScore: function () {
    		score += 1;
    	}
    };
}

exports.create = create;

