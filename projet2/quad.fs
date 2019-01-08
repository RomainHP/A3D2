precision mediump float;

varying vec3 vOrigin;
varying vec3 vRay;
varying vec2 vDeltaPos;

void main(void)
{
    if ((vRay.x <= 0.021 && vRay.x >= 0.0) || (vRay.z <= 0.021 && vRay.z >= 0.0)
        || (vRay.z <= (-12.0+0.021) && vRay.z >= -12.0) || (vRay.z >= (12.0-0.021) && vRay.z <= 12.0)
        || (vRay.x <= (-18.0+0.021) && vRay.x >= -18.0) || (vRay.x >= (18.0-0.021) && vRay.x <= 18.0)) {
        gl_FragColor = vec4(1.0);
    } else {
        gl_FragColor = vec4((vRay.x+18.0)/36.0,0.0,(vRay.z+12.0)/24.0,1.0);
    }
}