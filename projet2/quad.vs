attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec3 vOrigin;
varying vec3 vDirection;

void main(void) {
    // float pixelSize = 36.0/900.0;
    // float ecartX = 0.0;
    // float ecartY = 0.0;
    // if (aVertexPosition.x>0.0){
    //     ecartX = - pixelSize/2.0;
    // } else if (aVertexPosition.x<0.0) {
    //     ecartX = pixelSize/2.0;
    // }
    // if (aVertexPosition.y>0.0){
    //     ecartY = - pixelSize/2.0;
    // } else if (aVertexPosition.y<0.0) {
    //     ecartY = pixelSize/2.0;
    // }
	gl_Position = vec4(aVertexPosition, 1.0);
    vOrigin = vec3(0.0,0.0,0.0);
    vDirection = vec3(aVertexPosition.x*18.0, 50.0, aVertexPosition.y*12.0);
}