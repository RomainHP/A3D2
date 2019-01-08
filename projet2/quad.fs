precision mediump float;

varying vec3 vOrigin;
varying vec3 vDirection;

//----------------------------------------------------------------------//
struct Ray
{
  vec3 origin;
  vec3 direction;
};

//----------------------------------------------------------------------//
struct Sphere
{
  vec3 center;
  float radius;
};

//----------------------------------------------------------------------//
vec3 pointIntersection(Ray ray, Sphere sphere)
{
    vec3 origin = ray.origin - sphere.center;   // pour avoir (x-xc),(y-yc),(z-zc)

    float a = dot(ray.direction,ray.direction); // correspond a dir.x2 + dir.y2 + dir.z2

    float b = 2.0 * dot(origin,ray.direction);

    float c = dot(origin,origin) - sphere.radius*sphere.radius;

    float discriminant = b*b - 4.0*a*c;

    float pt = 0.0;
    if (discriminant>0.0){
        float pt1 = (-b-sqrt(discriminant)) / (2.0*a);
        float pt2 = (-b+sqrt(discriminant)) / (2.0*a);
        if (pt1<pt2) {
            pt = pt1;
        } else {
            pt = pt2;
        }
    }else if (discriminant==0.0){
        pt = (-b)/(2.0*a);
    }
    return ray.direction*pt+origin;
}

//----------------------------------------------------------------------//
float intersectionDisque(Ray ray, Sphere sphere)
{
    vec3 origin = ray.origin - sphere.center;   // pour avoir (x-xc),(y-yc),(z-zc)

    float a = dot(ray.direction,ray.direction); // correspond a dir.x2 + dir.y2 + dir.z2

    float b = 2.0 * dot(origin,ray.direction);

    float c = dot(origin,origin) - sphere.radius*sphere.radius;

    float discriminant = b*b - 4.0*a*c;
    return discriminant;
}

//----------------------------------------------------------------------//
void main(void)
{
    Ray ray = Ray(vOrigin,normalize(vDirection));
    Sphere sphere = Sphere(vec3(0.0,200.0,0.0),40.0);

    if ((vDirection.x <= 0.021 && vDirection.x >= 0.0) || (vDirection.z <= 0.021 && vDirection.z >= 0.0)
        || (vDirection.z <= (-12.0+0.02) && vDirection.z >= -12.0) || (vDirection.z >= (12.0-0.02) && vDirection.z <= 12.0)
        || (vDirection.x <= (-18.0+0.02) && vDirection.x >= -18.0) || (vDirection.x >= (18.0-0.02) && vDirection.x <= 18.0)) {
        gl_FragColor = vec4(1.0);
    } else {
        if (intersectionDisque(ray,sphere)>=0.0){
            gl_FragColor = vec4(1.0,0.0,0.0,1.0);
        } else {
            gl_FragColor = vec4((vDirection.x+18.0)/36.0,0.0,(vDirection.z+12.0)/24.0,1.0);
        }
    }
}