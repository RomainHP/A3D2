attribute vec3 aVertexPosition;
attribute vec4 aColor;
attribute float aRadius;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 vColor;

void main(void) {
	gl_PointSize = aRadius;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	vColor = aColor;
}
