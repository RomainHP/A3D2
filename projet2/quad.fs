precision mediump float;

varying vec3 vOrigin;
varying vec3 vRay;

float intersectionDisque(vec3 origin, vec3 direction, vec3 center, float radius)
{
    vec3 originDirection = origin + direction;
    float a = (originDirection.x) * (originDirection.x)
            + (originDirection.y) * (originDirection.y)
            + (originDirection.z) * (originDirection.z);

    float b = - 2.0 * originDirection.x * center.x
            - 2.0 * originDirection.y * center.y
            - 2.0 * originDirection.z * center.z;

    float c = - radius*radius + center.x*center.x + center.y*center.y + center.z*center.z;
    float discriminant = b*b - 4.0*a*c;
    return discriminant;
}

void main(void)
{
    if ((vRay.x <= 0.02 && vRay.x >= 0.0) || (vRay.z <= 0.02 && vRay.z >= 0.0)
        || (vRay.z <= (-12.0+0.021) && vRay.z >= -12.0) || (vRay.z >= (12.0-0.021) && vRay.z <= 12.0)
        || (vRay.x <= (-18.0+0.021) && vRay.x >= -18.0) || (vRay.x >= (18.0-0.021) && vRay.x <= 18.0)) {
        gl_FragColor = vec4(1.0);
    } else {
        gl_FragColor = vec4((vRay.x+18.0)/36.0,0.0,(vRay.z+12.0)/24.0,1.0);
    }
    // float radius = 10.0;
    // vec3 center = vec3(0.0,60.0,0.0);
    // if (intersectionDisque(vOrigin,vRay,center,radius)>=0.0){
    //     gl_FragColor = vec4(1.0,0.0,0.0,1.0);
    // } else {
    //     gl_FragColor = vec4(1.0,1.0,1.0,1.0);
    // }
}