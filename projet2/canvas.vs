attribute vec3 aVertexPosition;
attribute vec2 aTexCoord;

uniform sampler2D uTex;

//----------------------------------------------------------------------//
void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
}