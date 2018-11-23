// vertex shader. Exécuté pour chaque vertex dans le
// buffer en entrée.

// récupération des attributs, stockés dans buffer
attribute vec3 aVertexPosition;
attribute vec2 aTexCoords;

// uniform : ne change pas en fonction des vertex
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

// varying variable dépendante du vertex, qui sera utilisée par le fragment shader
varying vec2 texCoords;

void main(void) {
  // textCoords servira pour le fragment shader
  texCoords = aTexCoords;
	
  // calcul de la position finale du vertex après application
  // des matrices de transformation (liées à rotation souris et placement objet devant caméra)
  gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
