attribute vec3 aVertexPosition;

uniform mat4 uRayRotation;
uniform vec3 uRayOrigin;

varying vec3 vOrigin;
varying vec3 vDirection;

void main(void) {
    vOrigin = uRayOrigin;
    vDirection = vec3(aVertexPosition.x*18.0, 50.0, aVertexPosition.y*12.0);
    gl_Position = vec4(aVertexPosition, 1.0);
}