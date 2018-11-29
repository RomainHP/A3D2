attribute vec4 aVertexPosition;
attribute vec4 aColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 vColor;

void main(void) {
	gl_PointSize = aVertexPosition.w;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition.xyz, 1.0);
	vColor = aColor;
}
