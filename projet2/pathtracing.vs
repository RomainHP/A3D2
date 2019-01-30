attribute vec3 aVertexPosition;
attribute vec2 aTexCoord;

uniform mat4 uRayRotation;
uniform vec3 uRayOrigin;
uniform float uFocal;

varying vec3 vOrigin;
varying vec3 vDirection;
varying vec2 vTexCoord;

void main(void) {
    vOrigin = uRayOrigin;
    vDirection = vec4(uRayRotation * vec4(aVertexPosition.x*18.0, uFocal, aVertexPosition.y*12.0, 1.0)).xyz;
    vTexCoord = aTexCoord;
    gl_Position = vec4(aVertexPosition, 1.0);
}