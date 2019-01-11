

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
            window.setTimeout(callback, 1000/60);
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
function onDocumentKeyPress( event ) {
	var keyCode = event.which;
	var positionDelta = 1;
	//Z
	if ( keyCode == 122 ){
		rayOrigin[1] += positionDelta;
	}
	//Q
	else if ( keyCode == 113 ){
		rayOrigin[0] -= positionDelta;
	}
	//S
	else if ( keyCode == 115 ){
		rayOrigin[1] -= positionDelta;

	}
	//D
	else if ( keyCode == 100 ){
		rayOrigin[0] += positionDelta;
	}
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

	var newX = event.clientX;
	var newY = event.clientY;
	
	var deltaX = newX - lastMouseX;
	var deltaY = newY - lastMouseY;

	rotX += degToRad(deltaY / 2);
	rotZ += degToRad(deltaX / 2);

	mat4.identity(objMatrix);
	mat4.rotate(objMatrix, rotX, [1, 0, 0]);
	mat4.rotate(objMatrix, rotZ, [0, 0, 1]);

	lastMouseX = newX;
	lastMouseY = newY;
}
