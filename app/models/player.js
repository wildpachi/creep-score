// Player Object

function create (damage, startup, recovery) {
    return new Player(damage, startup, recovery);
}

function Player (damage, startup, recovery) {
	var dmg = damage
      , sup = startup
      , rec = recovery;

    var team = "red";

    var score = {hit: 0, deny: 0};

    return {
    	getDamage: function () {
    		return dmg;
    	},

    	getStartup: function () {
    		return startup;
    	},

    	getScore: function () {
    		return score.hit + " / " + score.deny;
    	},

        incScore: function (creep) {
            creep != team ? score.hit +=1 : score.deny += 1;
        }
    };
}

exports.create = create;

