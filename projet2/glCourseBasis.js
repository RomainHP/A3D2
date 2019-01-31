
// =====================================================
var gl;
// =====================================================
var rayRotation = mat4.create();
var rayOrigin = [0.0, 0.0, 0.0];
var random = 0.0;
var focal = 50.0;
var rayPerPixel = 1.0;
// =====================================================





// =====================================================
// Canvas
// =====================================================

var Canvas = { fname:'Canvas', loaded:-1, shader:null };

// =====================================================
Canvas.initAll = function()
{
	vertices = [
		-1.0, -1.0, 0.0,
		 1.0, -1.0, 0.0,
		 1.0,  1.0, 0.0,
		-1.0,  1.0, 0.0
	];

	texCoords = [
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0
	];

	this.vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vBuffer.itemSize = 3;
	this.vBuffer.numItems = 4;

	this.tBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	this.tBuffer.itemSize = 2;
	this.tBuffer.numItems = 4;

	loadShaders(this);
}

// =====================================================
Canvas.setShadersParams = function()
{
	gl.useProgram(this.shader);

	this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
	gl.enableVertexAttribArray(this.shader.vAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoord");
	gl.enableVertexAttribArray(this.shader.tAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
	gl.vertexAttribPointer(this.shader.tAttrib, this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// lecture de la texture texOUT qui a ete modifiee par le fragment shader
	gl.uniform1i(gl.getUniformLocation(this.shader, "uTex"), 1);
    gl.activeTexture(gl.TEXTURE0 + 1);
    gl.bindTexture(gl.TEXTURE_2D, PathTracing.texOUT);
}

// =====================================================
Canvas.draw = function()
{
	if(this.shader) {
		this.setShadersParams();
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems);
	}
}




// =====================================================
// PathTracing
// =====================================================

var PathTracing = { fname:'pathtracing', loaded:-1, shader:null };

// =====================================================
PathTracing.initAll = function()
{
	vertices = [
		-1.0, -1.0, 0.0,
		 1.0, -1.0, 0.0,
		 1.0,  1.0, 0.0,
		-1.0,  1.0, 0.0
	];

	texCoords = [
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
		0.0, 1.0
	];

	this.vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vBuffer.itemSize = 3;
	this.vBuffer.numItems = 4;

	this.tBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
	this.tBuffer.itemSize = 2;
	this.tBuffer.numItems = 4;

    this.fBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fBuffer);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE
        || gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_UNSUPPORTED) {
        console.log("Framebuffer attachment: FAILED")
    }

	// creation des textures texIN et texOUT
    this.texIN = createTexture();
	this.texOUT = createTexture();

    loadShaders(this);
}

// =====================================================
PathTracing.setShadersParams = function()
{
	gl.useProgram(this.shader);

	this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
	gl.enableVertexAttribArray(this.shader.vAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

	this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoord");
	gl.enableVertexAttribArray(this.shader.tAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
	gl.vertexAttribPointer(this.shader.tAttrib, this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// lecture de la texture texIN, qui sera lue par le fragment shader
	gl.uniform1i(gl.getUniformLocation(this.shader, "uTex"), 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texIN);

	this.shader.rayOriginUniform = gl.getUniformLocation(this.shader, "uRayOrigin");
	this.shader.rayRotationUniform =  gl.getUniformLocation(this.shader, "uRayRotation");
	this.shader.randomUniform =  gl.getUniformLocation(this.shader, "uRandom");
	this.shader.focalUniform =  gl.getUniformLocation(this.shader, "uFocal");
	this.shader.nbRaysUniform =  gl.getUniformLocation(this.shader, "uNbRays");
}

// =====================================================
PathTracing.draw = function()
{
	if(this.shader) {
		this.setShadersParams();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fBuffer);
		// Le fragment shader ecrit dans la texture texOUT
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texOUT, 0);
		setMatrixUniforms(this);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems);
	}
}

// =====================================================
PathTracing.swapTextures = function(){
	var tmp = this.texIN;
	this.texIN = this.texOUT;
	this.texOUT = tmp;
}

// =====================================================
PathTracing.resetTextures = function(){
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fBuffer);
	// Nettoyage des textures texIN et texOUT
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texIN, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.texOUT, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	rayPerPixel=1.0;	// au prochain coup, on repart de 1 rayon par pixel
}





// =====================================================
// FONCTIONS GENERALES, INITIALISATIONS
// =====================================================

// =====================================================
function createTexture()
{
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
                  gl.viewportWidth, gl.viewportHeight, 0,
                  gl.RGB, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
}


// =====================================================
function webGLStart() {
	var canvas = document.getElementById("WebGL-test");

	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
	document.addEventListener( 'keypress', onDocumentKeyPress, false );

	mat4.identity(rayRotation);

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
		console.log(gl.getShaderInfoLog(Obj3D.fshader));
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
	gl.uniformMatrix4fv(Obj3D.shader.rayRotationUniform, false, rayRotation);
	gl.uniform3fv(Obj3D.shader.rayOriginUniform, rayOrigin);
	gl.uniform1f(Obj3D.shader.randomUniform, random);		
	gl.uniform1f(Obj3D.shader.focalUniform, focal);
	gl.uniform1f(Obj3D.shader.nbRaysUniform, rayPerPixel);
}

// =====================================================
function shadersOk()
{
	if(PathTracing.loaded == 4 && Canvas.loaded == 4) return true;

	if(PathTracing.loaded < 0) {
		PathTracing.loaded = 0;
		PathTracing.initAll();
		return false;
	}

	if(Canvas.loaded < 0) {
		Canvas.loaded = 0;
		Canvas.initAll();
		return false;
	}
	
	return false;
}

// =====================================================
function drawScene() 
{
	if(shadersOk()) {
		PathTracing.draw();			// Calcul de la lumiere directe et indirecte
		rayPerPixel++;
		Canvas.draw();				// Affichage de la texOUT dans le Canvas
		PathTracing.swapTextures();	// texIN et texOUT sont echangees
		return true;
	}
	return false;
}



