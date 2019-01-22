

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
	var deplacement = [0, 0, 0, 1];

	// Z
	if ( keyCode == 122 ){
		deplacement[1] += positionDelta;
	}
	// Q
	else if ( keyCode == 113 ){
		deplacement[0] -= positionDelta;
	}
	// S
	else if ( keyCode == 115 ){
		deplacement[1] -= positionDelta;
	}
	// D
	else if ( keyCode == 100 ){
		deplacement[0] += positionDelta;
	}
	else{
		return;
	}

	// Deplacement selon la rotation de la camera
	var deplacementRotation = [0, 0, 0, 0];
	mat4.multiplyVec4(rayRotation, deplacement, deplacementRotation);
	
	rayOrigin[0] += deplacementRotation[0];
	rayOrigin[1] += deplacementRotation[1];
	rayOrigin[2] += deplacementRotation[2];
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
	
	var deltaX = lastMouseX - newX;
	var deltaY = lastMouseY - newY;

	rotX += degToRad(deltaY / 5);
	rotZ += degToRad(deltaX / 5);

	mat4.identity(rayRotation);
	mat4.rotate(rayRotation, rotZ, [0, 0, 1]);
	mat4.rotate(rayRotation, rotX, [1, 0, 0]);

	lastMouseX = newX;
	lastMouseY = newY;
}
