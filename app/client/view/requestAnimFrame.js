// Animation function with fallbacks

exports.requestAnimFrame = function (f) {
	return requestAnimFrame(f);
}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

// shim layer with setTimeout fallback
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/