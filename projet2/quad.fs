precision mediump float;

varying vec3 vOrigin;
varying vec3 vDirection;

#define M_PI            3.141592653589793
#define NEAR            50.0

#define NB_LIGHTS       1
#define NB_SPHERES      1
#define NB_PLANES       1

#define NONE    0
#define SPHERE  1
#define PLANE   2

//----------------------------------------------------------------------//
struct Material
{
    vec3 kd;    // (entre 0 et 1, multiplie par -ks)
    float ks;
    float n;    // (>0)
};

//----------------------------------------------------------------------//
struct Plane
{
    vec3 normal;
    float scal;
    Material material;
};

//----------------------------------------------------------------------//
struct Sphere
{
  vec3 center;
  float radius;
  Material material;
};

//----------------------------------------------------------------------//
struct Light
{
  vec3 position;
  vec3 power;
};

//----------------------------------------------------------------------//
struct Ray
{
  vec3 origin;
  vec3 direction;
};

//----------------------------------------------------------------------//
struct RenderInfo
{
  vec3 point;
  vec3 normal;
  Material material;
};

//----------------------------------------------------------------------//
struct Scene
{
  Light[NB_LIGHTS] lights;
  Sphere[NB_SPHERES] spheres;
  Plane[NB_PLANES] planes;
};

//----------------------------------------------------------------------//
float intersectionSphere(Ray ray, Sphere sphere)
{
    vec3 origin = ray.origin - sphere.center;   // pour avoir (x-xc),(y-yc),(z-zc)

    // on developpe la formule de la sphere en fonction de (O+dt)
    float a = dot(ray.direction,ray.direction); // correspond a dir.x2 + dir.y2 + dir.z2

    float b = 2.0 * dot(origin,ray.direction);

    float c = dot(origin,origin) - sphere.radius*sphere.radius;

    // on resout ensuite l'equation du second degre en calculant le discriminant
    float discriminant = b*b - 4.0*a*c;

    float t = -1.0;  // temps ou le rayon intersecte la sphere
    if (discriminant>0.0){
        float t1 = (-b-sqrt(discriminant)) / (2.0*a);
        float t2 = (-b+sqrt(discriminant)) / (2.0*a);
        // on garde le point d'intersection le plus proche (donc t minimal)
        if (t1<t2) {
            t = t1;
        } else {
            t = t2;
        }
    }else if (discriminant==0.0){
        t = (-b)/(2.0*a);
    }
    
    return t;
}

//----------------------------------------------------------------------//
float intersectionPlane(Ray ray, Plane plane)
{
    // float dotRayPlane = dot(ray.direction,plane.normal);
    // if (dotRayPlane==0.0){
    //     return false;
    // } else {
    //     vec3 planeOrigin = plane.normal * ray.origin;
    //     ray.t = ( - planeOrigin.x - planeOrigin.y - planeOrigin.z - plane.scal) / (ray.direction.x*plane.normal.x + ray.direction.y*plane.normal.y + ray.direction.z*plane.normal.z );    
    //     return true;
    // }
    return -1.0;
}

//----------------------------------------------------------------------//
void createFixedScene(out Scene scene)
{
    Material material = Material(vec3(1.0,0.0,1.0), 1.0, 3.0);

    Light lights[NB_LIGHTS];
    lights[0] = Light(vec3(-40.0,20.0,0.0), vec3(1.0,1.0,1.0));

    Sphere spheres[NB_SPHERES];
    spheres[0] = Sphere(vec3(0.0,200.0,0.0), 10.0, material);

    Plane planes[NB_PLANES];
    planes[0] = Plane(vec3(1.0,1000.0,0.0), 1.0, material); 

    Scene scene;
    scene.lights[0] = Light(vec3(-40.0,20.0,0.0), vec3(1.0,1.0,1.0));
    scene.spheres[0] = Sphere(vec3(0.0,200.0,0.0), 10.0, material);
    scene.planes[0] = Plane(vec3(1.0,1000.0,0.0), 1.0, material); 
}

//----------------------------------------------------------------------//
void main(void)
{
    //h = normalize(i+o);
    //cos alpha = dot(n,h);
    //phong = kd/M_PI + vec3(ks) * (n+8)/8*M_PI * pow(cos(alpha),n);
    //Scene scene = createFixedScene();
    //Ray ray = Ray(vOrigin, normalize(vDirection));

    //float tmin = -1.0;
    //int nearestObject = -1;
    //int objectType = NONE;
    // for (int i=0; i<NB_SPHERES; i++){
    //     float t = intersectionSphere(ray, scene.spheres[i]);
    //     if (t>=0.0){
    //         if (tmin==-1.0 || t<tmin) {
    //             objectType = SPHERE;
    //             nearestObject = i;
    //             tmin = t;
    //         }
    //     }
    // }

    //RenderInfo renderinfo;
    //if (nearestObject>=0){
        // vec3 point = ray.direction*ray.t + ray.origin;
        // vec3 n = normalize(point-scene.spheres[nearestObject].center);
        // n.y = -n.y;
        // renderinfo = RenderInfo(point, n, scene.spheres[nearestObject].material);

        // vec3 wi = normalize(light.position-renderinfo.point);
        // float cosTi = max(0.0,dot(wi,renderinfo.normal));
        // vec3 Lo = light.power * renderinfo.material.kd/M_PI * cosTi;
        // gl_FragColor = vec4(Lo,1.0);
    //} else {
        gl_FragColor = vec4(0.0,0.0,0.0,1.0);
    //}
}