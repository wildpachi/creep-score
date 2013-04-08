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
