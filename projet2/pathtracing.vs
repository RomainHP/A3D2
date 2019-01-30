attribute vec3 aVertexPosition;
attribute vec2 aTexCoord;

uniform mat4 uRayRotation;
uniform vec3 uRayOrigin;
uniform float uRandom;
uniform float uFocal;
uniform sampler2D uTex;
uniform int uMoving;
varying int uNbRays;

varying vec3 vOrigin;
varying vec3 vDirection;
varying float vRandom;
varying vec2 vTexCoord;
varying bool vMoving;
varying int vNbRays;

void main(void) {
    vRandom = uRandom;
    vOrigin = uRayOrigin;
    vDirection = vec4(uRayRotation * vec4(aVertexPosition.x*18.0, uFocal, aVertexPosition.y*12.0, 1.0)).xyz;
    vTexCoord = aTexCoord;
    vMoving = (uMoving==0);
    vNbRays = uNbRays;
    gl_Position = vec4(aVertexPosition, 1.0);
}