// =====================================================
// PLAN 3D, Support géométrique
// =====================================================

var Plane3D = { fname:'plane', loaded:-1, shader:null };

// =====================================================
// Initialise et envoie les tableaux sur la CG
Plane3D.initAll = function()
{

	vertices = [
		-0.7, -0.7, 0.0,
		 0.7, -0.7, 0.0,
		 0.7,  0.7, 0.0,
		-0.7,  0.7, 0.0
    ];

	texcoords = [
		0.0,0.0,
		0.0,1.0,
		1.0,1.0,
		1.0,0.0
	];

    // Envoi de vertices sur la CG
	this.vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.vBuffer.itemSize = 3; // le nombre de valeurs par vertex (x, y, z)
	this.vBuffer.numItems = 4; // le nombre de vertex total dans le buffer

    // Envoi de texcoords sur la CG
	this.tBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
	this.tBuffer.itemSize = 2; // le nombre de valeurs par vertex
	this.tBuffer.numItems = 4; // le nombre de vertex total dans le buffer

	console.log("Plane3D : init buffers ok.");

    // charge les shaders de Plane3D plane.vs et plane.fs
	loadShaders(this);

	console.log("Plane3D : shaders loading...");
}


// =====================================================
Plane3D.setShadersParams = function()
{
	console.log("Plane3D : setting shader parameters...")

    // spécifie à webGL que le programme shader de Plane3D fait partie de l'état de rendu courant
	gl.useProgram(this.shader); 

    // -------- ATTRIBUTS --------

    // V BUFFER : vertices
    // on indique la présence d'un attribut nommé aVertexPosition dans le vertex shader
    this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
    // vAttrib est un attribut de type array
    gl.enableVertexAttribArray(this.shader.vAttrib);
    // on met en place le pointeur vers vBuffer (précédemment initialisé dans initAll)
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
	gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // T BUFFER : texCoords
	this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoords");
	gl.enableVertexAttribArray(this.shader.tAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
	gl.vertexAttribPointer(this.shader.tAttrib,this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // -------- UNIFORM --------
    
	this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
	this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");

	console.log("Plane3D : parameters ok.")

}


// =====================================================
Plane3D.draw = function()
{
	if(this.shader) {
            // // met en place les paramètres pour le vertex shader (si ce n'est pas déjà fait)
			this.setShadersParams();
            setMatrixUniforms(this); // set les matrices dans le vertex shader (rotation souris prise ne compte)
            
            // on lance le dessin.
            // les triangles pour la face visible
            gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems);
            // le contour nécessaire pour qu'on puisse voir le dessous (à cause du cull face dans initGL)
			gl.drawArrays(gl.LINE_LOOP, 0, this.vBuffer.numItems);
	}
}

Plane3D.shadersOk = function()
{
    if(Plane3D.loaded == 4) return true;

	if(Plane3D.loaded < 0) {
        Plane3D.loaded = 0;
        // prépare tout (vertex, shaders, params, matrices MV et P... avant le draw)
        // incrémente loaded jusqu'à si exécuté correctement. 
		Plane3D.initAll();
		return false;
	}

	return false;
}