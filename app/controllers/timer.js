// Controls Time and Time related functions
function Timer () {
	this.timer = 0;
	this.count = 0;
}

Timer.prototype.start = function start () {
	var self = this;
	this.timer = setInterval( function () {
		tick(self);
	}, 10);
}

Timer.prototype.stop  = function stop () {
	clearInterval(this.timer);
	this.timer = 0;
}

module.exports = Timer;

function tick (self) {
	self.count += 10;
	if (self.count % 1000 == 0)
		console.log(self.count);
}
