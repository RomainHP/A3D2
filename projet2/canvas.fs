precision mediump float;

uniform sampler2D uTex;

varying vec2 vTexCoord;

//----------------------------------------------------------------------//
void main(void)
{
    gl_FragColor = vec4(texture2D(uTex, vTexCoord).rgb, 1.0); // lecture dans texOUT et ecriture dans le canvas
}