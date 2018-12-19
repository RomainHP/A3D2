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
	var delta = [deltaX,-deltaY,0,1];
	var newDelta = [0,0,0,0];
	for(i=0;i<4;i++){
		for(j=0;j<4;j++){
			newDelta[i] += objMatrix[i*4+j]*delta[j];
		}
	}
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
		//mouvement source
		lightSource[0] += newDelta[0]/newDelta[3]/10;
		lightSource[1] += newDelta[1]/newDelta[3]/10;
		lightSource[2] += newDelta[2]/newDelta[3]/10;
		Light3D.redraw();

	}else if(shiftDown){
		//mouvement bille
		Ball3D.speed[0] += newDelta[0]/newDelta[3]/300;
		Ball3D.speed[1] += newDelta[1]/newDelta[3]/300;
		Ball3D.speed[2] += newDelta[2]/newDelta[3]/300;
	}
}
//=======================================================
function handleScroll(event){
	deltaZoom -= event.deltaY/10;
}
