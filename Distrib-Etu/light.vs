attribute vec4 aLightSource;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

void main(void) {
	gl_Position = uPMatrix * uMVMatrix * vec4(aLightSource.xyz, 1.0);
	gl_PointSize = 800.0*uPMatrix[0][0]*0.04/gl_Position.w;
}