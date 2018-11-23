
// =====================================================
var gl;
// =====================================================
var mvMatrix = mat4.create();  // modelView
var pMatrix = mat4.create();   // projection
var objMatrix = mat4.create(); // ici, utilisée pour les rotations souris
// =====================================================




// =====================================================
// FONCTIONS GENERALES, INITIALISATIONS
// =====================================================


// =====================================================
function webGLStart() {
	var canvas = document.getElementById("WebGL-test"); // canvas utilisé par webGL

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
		// initialise le canvas pour webGL
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		gl.viewport(0, 0, canvas.width, canvas.height);

		gl.clearColor(0.7, 0.7, 0.7, 1.0); // couleur de fond
		
		// activation z-buffer : après le passage au fragment shader, vérifie si le pixel
		// est devant (on remplace l'ancien) ou derrière (on jette) un autre.
		gl.enable(gl.DEPTH_TEST);

		// on retire les triangles dont la face qui apparaît est celle de dos
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
				// Compile le vertex shader et le fragment shaders sur la CG.
				compileShaders(Obj3D);
				// met en place les paramètres pour le vertex shader
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

	// exécuté de bas en haut.
		// construit la matrice de projection
		mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
		mat4.identity(mvMatrix); // pourquoi ??
		mat4.translate(mvMatrix, [0.0, 0.0, -2.0]); // translation des objets en face de la caméra
		mat4.multiply(mvMatrix, objMatrix);	// rotation des objets (matrice objMatrix modifiée par callbacks souris)

	// on envoie les matrices en tant que variables uniform dans le vertex shader
		gl.uniformMatrix4fv(Obj3D.shader.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(Obj3D.shader.mvMatrixUniform, false, mvMatrix);
}


// =====================================================
function shadersOk()
{
	// vérifie si tous les shaders sont ok
	// ajouter && new.shadersOk() pour un nouveau shader à ajouter
	return Plane3D.shadersOk();
}

// =====================================================
function drawScene() {
	// executed each tick

	// on efface tous les pixels avant de redessiner
	gl.clear(gl.COLOR_BUFFER_BIT);

	// on ne redessine que si les shaders sont prêts
	// shadersOk déclenche initAll
	if(shadersOk()) {

		Plane3D.draw(); // plan
	}

}



