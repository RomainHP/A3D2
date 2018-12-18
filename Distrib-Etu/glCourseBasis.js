
// =====================================================
var gl;
// =====================================================
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var lightSource = [0.0,0.0,0.5];
var ni = 1.5;
var lightSourceDeltaX = 0.0;
var lightSourceDeltaY = 0.0;
var objMatrix = mat4.create();
var deltaZoom = 0.0;

var gravity = 9.81;
// =====================================================

// =====================================================
// Lumière 3D, position de la source de lumière
// =====================================================

var Light3D = { fname:'light', loaded:-1, shader:null };

// =====================================================
Light3D.initAll = function()
{

	this.lBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.lBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lightSource), gl.STATIC_DRAW);
	this.lBuffer.itemSize = 3;
	this.lBuffer.numItems = 1;

	loadShaders(this);
}

// =====================================================
Light3D.redraw = function()
{
	gl.bindBuffer(gl.ARRAY_BUFFER, this.lBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lightSource), gl.STATIC_DRAW);
}

// =====================================================
Light3D.setShadersParams = function()
{
	gl.useProgram(this.shader);

	this.shader.lAttrib = gl.getAttribLocation(this.shader, "aLightSource");
	gl.enableVertexAttribArray(this.shader.lAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.lBuffer);
	gl.vertexAttribPointer(this.shader.lAttrib, this.lBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
	this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
}

// =====================================================
Light3D.draw = function()
{
	if(this.shader) {		
		this.setShadersParams();
		setMatrixUniforms(this);
		gl.drawArrays(gl.POINTS, 0, this.lBuffer.numItems);	
	}
}


// =====================================================
// PLAN 3D, Support géométrique
// =====================================================

var Plane3D = { fname:'plane', loaded:-1, shader:null };

// =====================================================
Plane3D.initAll = function()
{
	vertices = [
		// Face avant du plan
		-0.7, -0.7, 0.0,
		 0.7, -0.7, 0.0,
		 0.7,  0.7, 0.0,
		-0.7,  0.7, 0.0,
		// Face arrière du plan
		-0.7, 0.7, 0.0,
		 0.7,  0.7, 0.0,
		 0.7, -0.7, 0.0,
		-0.7,  -0.7, 0.0
	];

	texcoords = [
		// Face avant du plan
		0.0,0.0,
		0.0,1.0,
		1.0,1.0,
		1.0,0.0,
		// Face arrière du plan
		1.0,0.0,
		1.0,1.0,
		0.0,1.0,
		0.0,0.0
	];

	this.vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vBuffer.itemSize = 3;
	this.vBuffer.numItems = 8;

	this.tBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
	this.tBuffer.itemSize = 2;
	this.tBuffer.numItems = 8;

	console.log("Plane3D : init buffers ok.");

	loadShaders(this);

	console.log("Plane3D : shaders loading...");
}

// =====================================================
Plane3D.setShadersParams = function()
{
	console.log("Plane3D : setting shader parameters...")

	gl.useProgram(this.shader);

	this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
	gl.enableVertexAttribArray(this.shader.vAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoords");
	gl.enableVertexAttribArray(this.shader.tAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
	gl.vertexAttribPointer(this.shader.tAttrib,this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
	this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");

	console.log("Plane3D : parameters ok.")
}

// =====================================================
Plane3D.draw = function()
{
	if(this.shader) {		
			this.setShadersParams();
			setMatrixUniforms(this);
			gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems);
			gl.drawArrays(gl.LINE_LOOP, 0, this.vBuffer.numItems);
	}
}


// =====================================================
// BALLS 3D
// =====================================================

var Balls3D = { fname:'balls', loaded:-1, shader:null };

Balls3D.animationRotation = false;

// =====================================================
Balls3D.initAll = function(nbBilles = 50)
{
	//========================================================================
	//Remplissage aléatoire des positions de départ 
	function initRandomPos(nbBilles) {
		
		var random = [];

		//Remplissage de la position en x,y,z et du rayon en w
		for(var i=0;i<nbBilles;i++){
			radius = (Math.random() * (0.04 - 0.10) + 0.10);
			random.push((Math.random() * (-0.7 - 0.7) + 0.7));
			random.push((Math.random() * (-0.7 - 0.7) + 0.7));
			random.push((Math.random() * (0.0 - 0.4) + 0.4));
			random.push(radius);
		}

		return random;
	}

	this.vertices = initRandomPos(nbBilles);

	//========================================================================
	//Remplissage aléatoire des couleurs des billes
	function randomColors(nbBilles){
		var randomColor = [];

		for(var i=0;i<nbBilles;i++){
			randomColor.push((Math.random() * (0.0 - 1.0) + 1.0));
			randomColor.push((Math.random() * (0.0 - 1.0) + 1.0));
			randomColor.push((Math.random() * (0.0 - 1.0) + 1.0));
			randomColor.push((Math.random() * (0.0001 - 0.3) + 0.3));
		}

		return randomColor;
	}

	this.colors = randomColors(nbBilles);

	//========================================================================
	//Remplissage des vitesses initiales des billes
	function initSpeed(nbBilles){
		var initSpeed = [];

		for(var i=0;i<nbBilles;i++){
			initSpeed.push(0.0);
			initSpeed.push(0.0);
			initSpeed.push(0.0);
		}

		return initSpeed;
	}

	this.speed = initSpeed(nbBilles);

	//========================================================================

	this.vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
	this.vBuffer.itemSize = 4;
	this.vBuffer.numItems = nbBilles;

	this.cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
	this.cBuffer.itemSize = 4;
	this.cBuffer.numItems = nbBilles;

	console.log("Balls3D : init buffers ok.");

	loadShaders(this);

	console.log("Balls3D : shaders loading...");
}

// =====================================================
Balls3D.setShadersParams = function()
{
	console.log("Balls3D : setting shader parameters...")

	gl.useProgram(this.shader);

	// Vertex Position
	this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
	gl.enableVertexAttribArray(this.shader.vAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// Color
	this.shader.cAttrib = gl.getAttribLocation(this.shader, "aColor");
	gl.enableVertexAttribArray(this.shader.cAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
	gl.vertexAttribPointer(this.shader.cAttrib,this.cBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
	this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
	this.shader.lightSourceUniform = gl.getUniformLocation(this.shader, "uLightSource");

	console.log("Balls3D : parameters ok.")
}

// =====================================================
Balls3D.draw = function()
{
	if(this.shader) {		
		this.setShadersParams();
		setMatrixUniforms(this);
		gl.drawArrays(gl.POINTS, 0, this.vBuffer.numItems);	
	}
}

// =====================================================
// Calcul des forces exercees sur chaque balle
Balls3D.calculForces = function()
{
	// Vecteurs forces des balls
	forces = Array(3*this.vBuffer.numItems).fill(0);
	forces.fill(0);
	// bilans des forces de chaque ball
	for (var i = 0; i < this.vBuffer.numItems; i++) {
		// test des collisions entre ball
		for (var k = i+1; k < this.vBuffer.numItems; k++){
			radiusA = this.vertices[i*4+3];
			radiusB = this.vertices[k*4+3];
			AB = [this.vertices[k*4]-this.vertices[i*4], this.vertices[k*4+1]-this.vertices[i*4+1], this.vertices[k*4+2]-this.vertices[i*4+2]];
			normAB = Math.sqrt(AB[0]*AB[0] + AB[1]*AB[1] + AB[2]*AB[2]);
			distance = radiusA + radiusB - normAB;
			if (distance>0){ // collision
				fx = ressort * distance * (-AB[0]/normAB);
				fy = ressort * distance * (-AB[1]/normAB);
				fz = ressort * distance * (-AB[2]/normAB);
				// forces sur A
				forces[i*3]   += fx * (radiusB/radiusA); // la ball la plus lourde ressent moins de forces
				forces[i*3+1] += fy * (radiusB/radiusA);
				forces[i*3+2] += fz * (radiusB/radiusA);
				// forces sur B
				forces[k*3]   -= fx * (radiusA/radiusB);
				forces[k*3+1] -= fy * (radiusA/radiusB);
				forces[k*3+2] -= fz * (radiusA/radiusB);
			}
		}
	}
	return forces;
}

// =====================================================
Balls3D.animate = function()
{
	if(shadersOk()) {
		nbPasTemps = 10;
		frottement = 0.001;
		ressort= 10.0;
		// boucle pas de temps
		for (var j = 0; j < nbPasTemps; j++) {
			forces = this.calculForces(2);
			// boucle sur les objets
			for (var i = 0; i < this.vBuffer.numItems; i++) {
				// rayon et masse
				radius = this.vertices[i*4+3];
				mass = radius*0.1;
				// vitesse
				vx = this.speed[i*3]   + 0.001 * (forces[i*3] / mass);
				vy = this.speed[i*3+1] + 0.001 * (forces[i*3+1] / mass);
				vz = this.speed[i*3+2] + 0.001 * (forces[i*3+2] / mass) - 0.001 * gravity;
				// si il y a une animation en fonction de la rotation de la scene
				if (this.animationRotation){
					vx -= 0.001 * (Math.cos(rotX)*Math.sin(rotZ)) * gravity;
					vy -= 0.001 * (Math.sin(rotX)*Math.cos(rotZ)) * gravity;
				}
				// frottement
				vx -= frottement * vx;
				vy -= frottement * vy;
				vz -= frottement * vz;
				// position
				x = this.vertices[i*4] + 0.001 * vx;
				y = this.vertices[i*4+1] + 0.001 * vy;
				z = this.vertices[i*4+2] + 0.001 * vz;
				// rebond
				if (z<radius){
					z = radius;
					vz = - 0.9 * vz;
				}
				if (x<-0.7+radius){
					x = -0.7+radius;
					vx = - 0.9 * vx;
				}
				if (y<-0.7+radius){
					y = -0.7+radius;
					vy = - 0.9 * vy;
				}
				if (x>0.7-radius){
					x = 0.7-radius;
					vx = - 0.9 * vx;
				}
				if (y>0.7-radius){
					y = 0.7-radius;
					vy = - 0.9 * vy;
				}
				// affectation vitesse
				this.speed[i*3] = vx;
				this.speed[i*3+1] = vy;
				this.speed[i*3+2] = vz;
				// affectation position
				this.vertices[i*4] = x;
				this.vertices[i*4+1] = y;
				this.vertices[i*4+2] = z
			}
		}
		// ajout au buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
	}
}


// =====================================================
// FONCTIONS GENERALES, INITIALISATIONS
// =====================================================

// =====================================================
function webGLStart() {
	var canvas = document.getElementById("WebGL-test");

	mat4.identity(objMatrix);
	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
	canvas.onwheel = handleScroll;
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;

	initGL(canvas);

	tick();
}

// =====================================================
function initGL(canvas)
{
	try {
		
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		gl.viewport(0, 0, canvas.width, canvas.height);

		gl.clearColor(0.7, 0.7, 0.7, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

	} catch (e) {}
	if (!gl) {
		console.log("Could not initialise WebGL");
	}
}

// =====================================================
function loadShaders(Obj3D) {
	loadShaderText(Obj3D,'.vs');
	loadShaderText(Obj3D,'.fs');
}

// =====================================================
function loadShaderText(Obj3D,ext) {   // lecture asynchrone...
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
			if(ext=='.vs') { Obj3D.vsTxt = xhttp.responseText; Obj3D.loaded ++; }
			if(ext=='.fs') { Obj3D.fsTxt = xhttp.responseText; Obj3D.loaded ++; }
			if(Obj3D.loaded==2) {
				Obj3D.loaded ++;
				compileShaders(Obj3D);
				Obj3D.setShadersParams();
				console.log("Shader ok : "+Obj3D.fname+".");
				Obj3D.loaded ++;
			}
    }
  }
  Obj3D.loaded = 0;
  xhttp.open("GET", Obj3D.fname+ext, true);
  xhttp.send();
}

// =====================================================
function compileShaders(Obj3D)
{
	console.log("compiling vshader "+Obj3D.fname);

	Obj3D.vshader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(Obj3D.vshader, Obj3D.vsTxt);
	gl.compileShader(Obj3D.vshader);
	if (!gl.getShaderParameter(Obj3D.vshader, gl.COMPILE_STATUS)) {
		console.log("Vertex Shader FAILED... "+Obj3D.fname+".vs");
		console.log(Obj3D.vsTxt);
		console.log(gl.getShaderInfoLog(Obj3D.vshader));
		return null;
	}

	console.log("compiling fshader "+Obj3D.fname);

	Obj3D.fshader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(Obj3D.fshader, Obj3D.fsTxt);
	gl.compileShader(Obj3D.fshader);
	if (!gl.getShaderParameter(Obj3D.fshader, gl.COMPILE_STATUS)) {
		console.log("Fragment Shader FAILED... "+Obj3D.fname+".fs");
		return null;
	}

	console.log("linking ("+Obj3D.fname+") shader");

	Obj3D.shader = gl.createProgram();

	gl.attachShader(Obj3D.shader, Obj3D.vshader);
	gl.attachShader(Obj3D.shader, Obj3D.fshader);

	gl.linkProgram(Obj3D.shader);
	if (!gl.getProgramParameter(Obj3D.shader, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders");
	}

	console.log("Compilation performed for ("+Obj3D.fname+") shader");
}

// =====================================================
function setMatrixUniforms(Obj3D) {
		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, [0.0, 0.0, -2.0 + deltaZoom]);
		mat4.multiply(mvMatrix, objMatrix);
		
		gl.uniform4fv(Obj3D.shader.lightSourceUniform, [lightSource[0], lightSource[1],lightSource[2], ni]);
		gl.uniformMatrix4fv(Obj3D.shader.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(Obj3D.shader.mvMatrixUniform, false, mvMatrix);
}


// =====================================================
function shadersOk()
{
	if((Plane3D.loaded == 4) && (Balls3D.loaded == 4) && (Light3D.loaded == 4)) return true;

	if(Plane3D.loaded < 0) {
		Plane3D.loaded = 0;
		Plane3D.initAll();
	}

	if(Balls3D.loaded < 0) {
		Balls3D.loaded = 0;
		Balls3D.initAll();
	}

	if(Light3D.loaded < 0) {
		Light3D.loaded = 0;
		Light3D.initAll();
	}

	return false;
}

// =====================================================
function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	if(shadersOk()) {
		Plane3D.draw();
		Balls3D.draw();
		Light3D.draw();
	}

}



