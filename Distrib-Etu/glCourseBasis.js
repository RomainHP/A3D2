
// =====================================================
var gl;
// =====================================================
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var objMatrix = mat4.create();

var gravity = 9.81;
var time = 0;
// =====================================================


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

// =====================================================
Balls3D.initAll = function()
{

	this.startingVertices = [
		-0.5,	-0.5,	0.5,
		 0.5,	-0.5,	0.4,
		 0.5,	0.5,	0.3,
		 0.3,	0.2,	0.5,
		 0.1,	-0.4,	0.2
	];

	// Rayons des balls
	this.radius = [
		20.0,
		30.0,
		40.0,
		50.0,
		60.0
	];

	// couleurs des balls
	colors = [
		0.0,	0.0,	0.0,	1.0,
		1.0,	0.0,	0.0,	1.0,
		0.0,	1.0,	0.0,	1.0,
		0.0,	0.0,	1.0,	1.0,
		1.0,	1.0,	0.0,	1.0
	];

	// Masse de l'objet
	this.mass = 10;

	// Vecteurs vitesses des balls
	this.startingSpeed = [
		0.0,	0.0,	0,
		0.0,	0.0,	0,
		0.0,	0.0,	0,
		0.0,	0.0,	0,
		0.0,	0.0,	0
	];

	// Vecteurs accelerations des balls
	this.startingAcceleration = [
		0.0,	0.0,	- gravity,
		0.0,	0.0,	- gravity,
		0.0,	0.0,	- gravity,
		0.0,	0.0,	- gravity,
		0.0,	0.0,	- gravity
	];

	this.vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.startingVertices), gl.STATIC_DRAW);
	this.vBuffer.itemSize = 3;
	this.vBuffer.numItems = 5;

	this.rBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.rBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.radius), gl.STATIC_DRAW);
	this.rBuffer.itemSize = 1;
	this.rBuffer.numItems = 5;

	this.cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	this.cBuffer.itemSize = 4;
	this.cBuffer.numItems = 5;

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

	// Radius
	this.shader.rAttrib = gl.getAttribLocation(this.shader, "aRadius");
	gl.enableVertexAttribArray(this.shader.rAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.rBuffer);
	gl.vertexAttribPointer(this.shader.rAttrib,this.rBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// Color
	this.shader.cAttrib = gl.getAttribLocation(this.shader, "aColor");
	gl.enableVertexAttribArray(this.shader.cAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
	gl.vertexAttribPointer(this.shader.cAttrib,this.cBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
	this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");

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
Balls3D.animate = function()
{
	//speed = this.startingSpeed;
	vertices = this.startingVertices.slice();
	// boucle sur z des objets
	for (var i = 0; i < vertices.length; i++) {
		indiceRadius = Math.trunc(i/3);
		//speed[i] = this.startingAcceleration[i] * (time/1000.0) + this.startingVertices[i];
		//vertices[i] = - 0.5 * gravity * (time/1000.0) * (time/1000.0) + speed[i] * (time/1000) + this.startingVertices[i];
		vertices[i] = 0.5 * this.startingAcceleration[i] * (time/1000) * (time/1000) + this.startingSpeed[i] * (time/1000) + this.startingVertices[i];
		// rebond
		if (vertices[i]-(this.radius[indiceRadius]/500.0)<0.0){
			this.startingVertices = vertices.slice();
			this.startingAcceleration[i] = - Math.sign(this.startingAcceleration[i]) * 100/time;
		} else if (vertices[i]-(this.radius[indiceRadius]/500.0)>0.5) {
			this.startingVertices = vertices.slice();
			this.startingAcceleration[i] =  - Math.sign(this.startingAcceleration[i]) * 100/time;
		}
	}
	// ajout au buffer
	this.vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vBuffer.itemSize = 3;
	this.vBuffer.numItems = 5;
	// dessin de la ball
	Balls3D.draw();
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
		mat4.translate(mvMatrix, [0.0, 0.0, -2.0]);
		mat4.multiply(mvMatrix, objMatrix);
		gl.uniformMatrix4fv(Obj3D.shader.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(Obj3D.shader.mvMatrixUniform, false, mvMatrix);
}


// =====================================================
function shadersOk()
{
	if((Plane3D.loaded == 4) && (Balls3D.loaded == 4)) return true;

	if(Plane3D.loaded < 0) {
		Plane3D.loaded = 0;
		Plane3D.initAll();
	}

	if(Balls3D.loaded < 0) {
		Balls3D.loaded = 0;
		Balls3D.initAll();
	}

	return false;

}

// =====================================================
function drawScene() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	if(shadersOk()) {
		time = time + 1;
		Plane3D.draw();
		//Balls3D.draw();
		Balls3D.animate();
	}

}



