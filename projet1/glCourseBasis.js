// =====================================================
var gl;
// =====================================================
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var lightSource = [0.0,0.0,0.5];	// position de la source de lumiere
var ni = 1.5;	// coefficient de refraction
var ks = 0.5;	// coefficient de specularite
var modeBrdf = 2.0;	// choix du type de brdf (0:sans / 1:lambert / 2:lambert+cook-torrance)
var lightSourceDeltaX = 0.0;
var lightSourceDeltaY = 0.0;
var objMatrix = mat4.create();
var deltaZoom = 0.0;
var lightColor = [1.0,1.0,1.0];		// couleur de la source de lumiere
var time=0;

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

Balls3D.animationRotation = false;	// animation en fonction de l'inclinaison de la camera

Balls3D.animation = true;	// animation

// =====================================================
Balls3D.initAll = function(nbBilles = 30)
{
	this.vertices = initRandomBallsPosition(nbBilles);
	this.colors = initRandomBallsColors(nbBilles);

	//========================================================================
	//Remplissage des vitesses initiales des billes
	this.speed = new Array(nbBilles*3).fill(0.0);
	
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

	this.modeMouvementCercle = false;
	this.frequenceRotation = 0.01;
}

// =====================================================
Balls3D.redraw = function(nbBilles)
{
	var oldNb = this.vBuffer.numItems;

	if (oldNb != nbBilles && nbBilles>=0){

		if (oldNb < nbBilles) {
			// on ajoute de nouvelles billes
			for (var i=oldNb; i<nbBilles; i++){
				var randomPos = randomBallPosition();
				this.vertices[i*4] = randomPos[0];
				this.vertices[i*4+1] = randomPos[1];
				this.vertices[i*4+2] = randomPos[2];
				this.vertices[i*4+3] = randomPos[3];


				var randomCol = randomBallColor();
				this.colors[i*4] = randomCol[0];
				this.colors[i*4+1] = randomCol[1];
				this.colors[i*4+2] = randomCol[2];
				this.colors[i*4+3] = randomCol[3];

				var newSpeed = new Array((nbBilles-oldNb)*3).fill(0.0);
				this.speed = this.speed.concat(newSpeed);
			}
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.vBuffer.numItems = nbBilles;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
		this.cBuffer.numItems = nbBilles;
	}

	
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
	this.shader.brdfParamsUniform = gl.getUniformLocation(this.shader, "uBrdfParams");
	this.shader.lightColorUniform = gl.getUniformLocation(this.shader, "uLightColor");

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
Balls3D.runMouvementCercle = function()
{
	this.modeMouvementCercle = true;
	this.vertices[0] = 0;
	this.vertices[1] = -0.7+this.colors[3];
	this.vertices[2] = this.colors[3];
}

// =====================================================
// Calcul des forces exercees sur chaque balle
Balls3D.calculForces = function()
{
	// Vecteurs forces des balles
	forces = Array(3*this.vBuffer.numItems).fill(0);
	// bilans des forces de chaque balle
	for (var i = 0; i < this.vBuffer.numItems; i++) {
		// test des collisions entre balle
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
				radiusBA = radiusB/radiusA;
				forces[i*3]   += fx * radiusBA; // la balle la plus lourde ressent moins de forces
				forces[i*3+1] += fy * radiusBA;
				forces[i*3+2] += fz * radiusBA;
				// forces sur B
				radiusAB = 1 / radiusBA;
				forces[k*3]   -= fx * radiusAB;
				forces[k*3+1] -= fy * radiusAB;
				forces[k*3+2] -= fz * radiusAB;
			}
		}
	}
	return forces;
}

// =====================================================
Balls3D.animate = function()
{
	if(shadersOk() && this.animation) {
		nbPasTemps = 10;
		frottement = 0.001;
		ressort= 10.0;
		// boucle pas de temps
		for (var j = 0; j < nbPasTemps; j++) {
			forces = this.calculForces();
			// boucle sur les objets
			for (var i = 0; i < this.vBuffer.numItems; i++) {
				// rayon et masse
				radius = this.vertices[i*4+3];
				mass = radius*0.1;

				// mouvement circulaire sur la balle 0 si le mode est active
				if (i==0 && this.modeMouvementCercle){	// pas de calculs de vitesse

					var delta = [0.7-radius,0.7-radius,0,0.001];	// cercle de rayon 0.7-radius
					var newDelta = [0,0,0,0];
					for(k=0;k<4;k++){	// conversion
						for(l=0;l<4;l++){
							newDelta[k] += objMatrix[k*4+l]*delta[l];
						}
					}
					var w = (Math.PI*2.0)*this.frequenceRotation;
					// x et y en fonction de la rotation sur le cercle
					x = Math.cos(w*time) * newDelta[0];
					y = Math.sin(w*time) * newDelta[1];
					z = radius;

				} else {	// sinon on calcule normalement

					// vitesse
					vx = this.speed[i*3]   + frottement * (forces[i*3] / mass);
					vy = this.speed[i*3+1] + 0.001 * (forces[i*3+1] / mass);
					vz = this.speed[i*3+2] + 0.001 * (forces[i*3+2] / mass) - frottement * gravity;
					// si il y a une animation en fonction de la rotation de la scene
					if (this.animationRotation){
						vx -= frottement * (Math.cos(rotX)*Math.sin(rotZ)) * gravity;
						vy -= frottement * (Math.sin(rotX)*Math.cos(rotZ)) * gravity;
					}
					// frottement
					vx -= frottement * vx;
					vy -= frottement * vy;
					vz -= frottement * vz;
					// position
					x = this.vertices[i*4] + frottement * vx;
					y = this.vertices[i*4+1] + frottement * vy;
					z = this.vertices[i*4+2] + frottement * vz;
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

				}
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

		gl.uniform3fv(Obj3D.shader.lightColorUniform, lightColor);
		gl.uniform3fv(Obj3D.shader.brdfParamsUniform, [ni, ks, modeBrdf]);
		gl.uniform3fv(Obj3D.shader.lightSourceUniform, lightSource);
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



