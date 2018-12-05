attribute vec4 aVertexPosition;
attribute vec4 aColor;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 vColor;
varying vec3 vLight;

void main(void) {
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition.xyz, 1.0);
	gl_PointSize = 800.0*uPMatrix[0][0]*aVertexPosition.w/gl_Position.w;
	vColor = aColor;

	// Apply lighting effect

	vec3 ambientLight = vec3(0.3, 0.3, 0.3);
	/*vec3 directionalLightColor = vec3(1, 1, 1);
	vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

	vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

	float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
	vLight = ambientLight + (directionalLightColor * directional);*/
	vLight = ambientLight;
}
