

// =====================================================
// Mouse management
// =====================================================
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var rotZ = 0;
var rotX = 0;

// =====================================================
window.requestAnimFrame = (function()
{
	return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback,
									/* DOMElement Element */ element)
         {
			 
            window.setTimeout(callback, 1000/60); // framerate = 60 fps
         };
})();

// ==========================================
function tick() {
	requestAnimFrame(tick);
	drawScene();
}

// =====================================================
function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

// =====================================================
function handleMouseDown(event) {
	mouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
}


// =====================================================
function handleMouseUp(event) {
	mouseDown = false;
}


// =====================================================
function handleMouseMove(event) {
	if (!mouseDown) {
		return;
	}

	// recupere X et Y de la souris
	var newX = event.clientX;
	var newY = event.clientY;

	// delta entre ancien X et le nouveau
	var deltaX = newX - lastMouseX;
	var deltaY = newY - lastMouseY;

	// angle de rotation en fonction de delta
	rotX += degToRad(deltaY / 2);
	rotZ += degToRad(deltaX / 2);

	// rotation de objMatrix sur les axes X et Z (Y fait office de profondeur, et ne bouge pas)
	mat4.identity(objMatrix);
	mat4.rotate(objMatrix, rotX, [1, 0, 0]);
	mat4.rotate(objMatrix, rotZ, [0, 0, 1]);

	lastMouseX = newX
	lastMouseY = newY;
}
