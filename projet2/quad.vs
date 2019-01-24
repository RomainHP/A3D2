attribute vec3 aVertexPosition;

uniform mat4 uRayRotation;
uniform vec3 uRayOrigin;
uniform float uRandom;

varying vec3 vOrigin;
varying vec3 vDirection;
varying float vRandom;

void main(void) {
    vRandom = uRandom;
    vOrigin = uRayOrigin;
    vDirection = vec4(uRayRotation * vec4(aVertexPosition.x*18.0, 50.0, aVertexPosition.y*12.0, 1.0)).xyz;
    gl_Position = vec4(aVertexPosition, 1.0);
}