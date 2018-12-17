

// =====================================================
// Mouse management
// =====================================================
var mouseDown = false;
var controlDown = false;
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
}

// =====================================================
function handleMouseUp(event) {
	mouseDown = false;
}
// =====================================================
function handleKeyUp(event) {
	controlDown = false;
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
	
	if(!controlDown){
		rotX += degToRad(deltaY / 2);
		rotZ += degToRad(deltaX / 2);

		mat4.identity(objMatrix);
		mat4.rotate(objMatrix, rotX, [1, 0, 0]);
		mat4.rotate(objMatrix, rotZ, [0, 0, 1]);

		lastMouseX = newX;
		lastMouseY = newY;
	}else{
		if(lightSource[0] < -2.5)
			lightSource[0] = -2.5;
		else if(lightSource[0] > 2.5 )
			lightSource[0] = 2.5;
		else
			lightSource[0] += deltaX/250;

			if(lightSource[1] < -2.5)
			lightSource[1] = -2.5;
		else if(lightSource[1] > 2.5 )
			lightSource[1] = 2.5;
		else
			lightSource[1] -= deltaY/250;
	}
}
//=======================================================
function handleScroll(event){
	deltaZoom -= event.deltaY;
}
