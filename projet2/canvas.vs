attribute vec3 aVertexPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

//----------------------------------------------------------------------//
void main(void) {
    vTexCoord = aTexCoord;
    gl_Position = vec4(aVertexPosition, 1.0);
}