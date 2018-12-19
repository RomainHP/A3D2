// =====================================================
// Mouse management
// =====================================================
var mouseDown = false;
var controlDown = false;
var shiftDown = false;
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
            window.setTimeout(callback, 1000/60);
         };
})();

// ==========================================
function tick() {
	requestAnimFrame(tick);
	Balls3D.animate();
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
function handleKeyDown(event) {
	if(event.key == "Control")
		controlDown = true;
	else if(event.key == "Shift")
		shiftDown = true;
}

// =====================================================
function handleMouseUp(event) {
	mouseDown = false;
}
// =====================================================
function handleKeyUp(event) {
	controlDown = false;
	shiftDown = false;
}
// =====================================================
function handleMouseMove(event) {
	if (!mouseDown) {
		return;
	}

	var newX = event.clientX;
	var newY = event.clientY;

	var deltaX = newX - lastMouseX;
	var deltaY = newY - lastMouseY;
	var coeff = 2500;

	if(!controlDown && !shiftDown){

		rotX += degToRad(deltaY / 2);
		rotZ += degToRad(deltaX / 2);

		mat4.identity(objMatrix);
		mat4.rotate(objMatrix, rotX, [1, 0, 0]);
		mat4.rotate(objMatrix, rotZ, [0, 0, 1]);

		lastMouseX = newX;
		lastMouseY = newY;

	}else if(controlDown){
		if((lightSource[0]+deltaX/coeff) < -1.)
			lightSource[0] = -1.;
		else if((lightSource[0]+deltaX/coeff) > 1. )
			lightSource[0] = 1.;
		else
			lightSource[0] += deltaX/coeff;

		if((lightSource[1]-deltaY/coeff) < -1.)
			lightSource[1] = -1.;
		else if((lightSource[1]-deltaY/coeff) > 1. )
			lightSource[1] = 1.;
		else
			lightSource[1] -= deltaY/coeff;

		Light3D.redraw();

	}else if(shiftDown){
		
		coeff = 500;
		Balls3D.speed[0] += deltaX/coeff;
		Balls3D.speed[1] -= deltaY/coeff;
	}
}
//=======================================================
function handleScroll(event){
	deltaZoom -= event.deltaY;
}
