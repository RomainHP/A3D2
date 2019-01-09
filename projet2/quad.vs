attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec3 vOrigin;
varying vec3 vDirection;

void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
    vOrigin = vec3(0.0,0.0,0.0);
    vDirection = vec3(aVertexPosition.x*18.0, 50.0, aVertexPosition.y*12.0);
}