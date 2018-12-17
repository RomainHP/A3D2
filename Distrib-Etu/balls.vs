attribute vec4 aVertexPosition;
attribute vec4 aColor;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform vec3 uLightSource;

varying vec4 vColor;
varying vec4 vLightSource;
varying vec4 vCoords;
varying float vRadius;

void main(void) {
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition.xyz, 1.0);
	gl_PointSize = 800.0*uPMatrix[0][0]*aVertexPosition.w/gl_Position.w;
	vColor = aColor;
	vLightSource = uMVMatrix * vec4(uLightSource, 1.0);
	vCoords = uMVMatrix * vec4(aVertexPosition.xyz, 1.0);
	vRadius = aVertexPosition.w;
}
