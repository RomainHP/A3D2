attribute vec4 aVertexPosition;
attribute vec4 aColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform vec3 uLightSource;
uniform vec3 uLightColor;
uniform vec3 uBrdfParams;

varying vec3 vColor;
varying vec4 vLightSource;
varying vec4 vCoords;
varying float vRadius;
varying float vNi;
varying float vKs;
varying float vSigma;
varying float vModeBrdf;
varying vec3 vLightColor;

void main(void) {

	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition.xyz, 1.0);
	gl_PointSize = 800.0*uPMatrix[0][0]*aVertexPosition.w/gl_Position.w;
	
	vLightSource = uMVMatrix * vec4(uLightSource, 1.0);
	vCoords = uMVMatrix * vec4(aVertexPosition.xyz, 1.0);

	vColor = aColor.xyz;
	vRadius = aVertexPosition.w;
	vNi = uBrdfParams.x;
	vKs = uBrdfParams.y;
	vSigma = aColor.w;
	vModeBrdf = uBrdfParams.z;
	vLightColor = uLightColor;
}
