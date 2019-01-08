precision mediump float;

varying vec3 vOrigin;
varying vec3 vDirection;

#define M_PI    3.141592653589793

//----------------------------------------------------------------------//
struct Light
{
  vec3 source;
  vec3 intensity;
};

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
  vec3 color;
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
bool intersectionSphere(Ray ray, Sphere sphere, out vec3 point)
{
    vec3 origin = ray.origin - sphere.center;   // pour avoir (x-xc),(y-yc),(z-zc)

    float a = dot(ray.direction,ray.direction); // correspond a dir.x2 + dir.y2 + dir.z2

    float b = 2.0 * dot(origin,ray.direction);

    float c = dot(origin,origin) - sphere.radius*sphere.radius;

    float discriminant = b*b - 4.0*a*c;

    float t = 0.0;
    if (discriminant>0.0){
        float t1 = (-b-sqrt(discriminant)) / (2.0*a);
        float t2 = (-b+sqrt(discriminant)) / (2.0*a);
        if (t1<t2) {
            t = t1;
        } else {
            t = t2;
        }
    }else if (discriminant==0.0){
        t = (-b)/(2.0*a);
    }

    point = ray.direction*t+origin;

    return discriminant>=0.0;
}

//----------------------------------------------------------------------//
void main(void)
{
    Light light = Light(vec3(-40.0,20.0,0.0), vec3(1.0,1.0,1.0));
    Ray ray = Ray(vOrigin, normalize(vDirection));
    Sphere sphere = Sphere(vec3(0.0,200.0,0.0), 10.0, vec3(1.0,0.0,0.0));
    Sphere sphere2 = Sphere(vec3(-40.0,200.0,0.0), 10.0, vec3(1.0,0.0,0.0));
    Sphere sphere3 = Sphere(vec3(20.0,180.0,0.0), 20.0, vec3(1.0,0.0,0.0));

    if ((vDirection.x <= 0.021 && vDirection.x >= 0.0) || (vDirection.z <= 0.021 && vDirection.z >= 0.0)
        || (vDirection.z <= (-12.0+0.02) && vDirection.z >= -12.0) || (vDirection.z >= (12.0-0.02) && vDirection.z <= 12.0)
        || (vDirection.x <= (-18.0+0.02) && vDirection.x >= -18.0) || (vDirection.x >= (18.0-0.02) && vDirection.x <= 18.0)) {
        gl_FragColor = vec4(1.0);
    } else {
        vec3 point;
        if (intersectionSphere(ray,sphere,point)){
            vec3 N = normalize(point-sphere.center);
            N.y = - N.y;
            vec3 wi = normalize(light.source-point);
	        float cosTi = max(0.0,dot(wi,N));	// angle entre i et N necessaire pour les brdfs
            vec3 Lo = light.intensity * sphere.color/M_PI * cosTi;
	        gl_FragColor = vec4(Lo,1.0);
        } else if (intersectionSphere(ray,sphere2,point)){
            vec3 N = normalize(point-sphere2.center);
            N.y = - N.y;
            vec3 wi = normalize(light.source-point);
	        float cosTi = max(0.0,dot(wi,N));	// angle entre i et N necessaire pour les brdfs
            vec3 Lo = light.intensity * sphere2.color/M_PI * cosTi;
	        gl_FragColor = vec4(Lo,1.0);
        } else if (intersectionSphere(ray,sphere3,point)){
            vec3 N = normalize(point-sphere3.center);
            N.y = - N.y;
            vec3 wi = normalize(light.source-point);
	        float cosTi = max(0.0,dot(wi,N));	// angle entre i et N necessaire pour les brdfs
            vec3 Lo = light.intensity * sphere3.color/M_PI * cosTi;
	        gl_FragColor = vec4(Lo,1.0);
        } else {
            gl_FragColor = vec4(0.0);
        }
    }
}