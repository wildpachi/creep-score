// Player Object

function create (damage, startup, recovery) {
    return new Player(damage, startup, recovery);
}

function Player (damage, startup, recovery) {
	var dmg = damage
      , sup = startup
      , rec = recovery;

    return {
    	getDamage: function () {
    		return dmg;
    	}
    };
}

exports.create = create;

