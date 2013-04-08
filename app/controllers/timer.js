// Controls Time and Time related functions
function Timer () {
	this.init  = new Date().getTime();
	this.now   = 0;
	this.timer = 0;
	this.queue = [];
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
	self.now = new Date().getTime();

	for (event in self.queue) {
		if (self.queue[event].delay < self.now) {
			self.queue[event].fn();
			console.log(self.queue[event].msg);
			self.queue.splice(event,1);
		}
	}
}

Timer.prototype.enqueue = function enqueue(delay, message, fn) {
	var self = this;
	var delayms = new Date().getTime() + delay;

	self.queue.push({delay: delayms, msg: message, fn: fn})
}