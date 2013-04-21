// Clock based Queue
var sys          = require('sys')
  , events       = require('events');

module.exports = Clock;

function Clock () {
	this.init  = new Date().getTime();
	this.now   = 0;
	this.timer = 0;
	this.queue = [];
}
sys.inherits(Clock, events.EventEmitter);


Clock.prototype.start = function start () {
	var self = this;
	self.timer = setInterval( function () {
		self.tick();
	}, 10);
}

Clock.prototype.stop  = function stop () {
	var self = this;

	clearInterval(this.timer);
	self.timer = 0;
}

Clock.prototype.add = function enqueue(delay, type, vars) {
	var self = this;
	var start = self.getTime() + delay;

	self.queue.push({start: start, type: type, vars: vars})
}

Clock.prototype.tick = function tick () {
	var self = this;
	self.now = self.getTime();
	for (event in self.queue) {
		if (self.queue[event].start < self.now) {
			self.emit(self.queue[event].type, self.queue[event].vars);
			self.queue.splice(event,1);
		}
	}
}

Clock.prototype.getTime = function getTime() {
	var self = this;
	return (new Date().getTime()) - self.init;
}

Clock.prototype.getRealTime = function getRealTime() {
	var self = this;
	var time = self.getTime() / 1000;
	var min  = pad( Math.floor(time/60) );
	var sec  = pad( Math.floor(time%60) );

	return min + ":" + sec;
}

function pad (x) {
	return (x < 10) ? "0" + x : x;
}