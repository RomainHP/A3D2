precision mediump float;

varying vec3 vOrigin;
varying vec3 vDirection;

//----------------------------------------------------------------------//
#define M_PI            3.141592653589793
#define NEAR            50.0
#define FAR             1000.0

#define NB_LIGHTS       2
#define NB_SPHERES      2
#define NB_PLANES       1

#define NONE    0
#define SPHERE  1
#define PLANE   2

//----------------------------------------------------------------------//
struct Material
{
    vec3 kd;
    float ks;
    float n;
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
  vec3 intersection;
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
float intersectionSphere(in Ray ray, in Sphere sphere)
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
float intersectionPlane(in Ray ray, in Plane plane)
{
    float t = -1.0;
    float dotDn = dot(ray.direction, plane.normal);
    if (dotDn!=0.0){
        vec3 pointPlan = plane.normal * plane.scal;
        t = dot(pointPlan-ray.origin, plane.normal)/dotDn;
    }
    return t;
}

//----------------------------------------------------------------------//
bool isPointVisible(in Light light, in Scene scene, in vec3 point, in int objType, in int indice)
{
    vec3 pointLight = point-light.position;
    Ray rayLight = Ray(light.position, normalize(pointLight));
    float normPoint = (pointLight.x)*(pointLight.x)+(pointLight.y)*(pointLight.y);
    for (int i=0; i<NB_SPHERES; i++){
        // on verifie si le point appartient a l'objet en question
        if (objType==SPHERE && indice==i) continue;
        Sphere sphere = scene.spheres[i];
        float t = intersectionSphere(rayLight, sphere);
        if (t>=0.0){
            vec3 pt = rayLight.direction*t + rayLight.origin;
            pointLight = pt-light.position;
            float norm = (pointLight.x)*(pointLight.x)+(pointLight.y)*(pointLight.y);
            if (norm<normPoint){
                return false;
            }
        }
    }
    for (int i=0; i<NB_PLANES; i++){
        // on verifie si le point appartient a l'objet en question
        if (objType==PLANE && indice==i) continue;
        Plane plane = scene.planes[i];
        float t = intersectionPlane(rayLight, plane);
        if (t>=0.0){
            vec3 pt = rayLight.direction*t + rayLight.origin;
            pointLight = pt-light.position;
            float norm = (pointLight.x)*(pointLight.x)+(pointLight.y)*(pointLight.y);
            if (norm<normPoint){
                return false;
            }
        }
    }
    return true;
}

//----------------------------------------------------------------------//
vec3 apply_phong(in Light light, in RenderInfo renderinfo, in vec3 wo)
{
    vec3 wi = normalize(light.position-renderinfo.intersection);
    vec3 h = normalize(wi+wo);
    float cosAlpha = max(0.0,dot(renderinfo.normal,h));

    vec3 brdf = renderinfo.material.kd/M_PI + vec3(renderinfo.material.ks) * (renderinfo.material.n+8.0)/(8.0*M_PI) * pow(cosAlpha,renderinfo.material.n);

    float cosTi = max(0.0,dot(wi,renderinfo.normal));
    vec3 Lo = light.power * brdf * cosTi;
    return Lo;
}

//----------------------------------------------------------------------//
void createRandomScene(in int nbMaxLights, in int nbMaxSpheres, in int nbMaxPlanes, out Scene scene)
{
    
}

//----------------------------------------------------------------------//
void createFixedScene(out Scene scene)
{
    // Materials
    Material material = Material(vec3(0.9,0.1,0.1), 0.2, 50.0);
    Material material2 = Material(vec3(0.1,0.1,0.9), 0.2, 30.0);
    Material material3 = Material(vec3(0.9,0.9,0.9), 0.2, 30.0);

    // Lights
    scene.lights[0] = Light(vec3(-50.0,20.0,30.0), vec3(2.0,2.0,2.0));
    scene.lights[1] = Light(vec3(50.0,20.0,30.0), vec3(1.0,0.1,1.0));

    // Spheres
    scene.spheres[0] = Sphere(vec3(0.0,100.0,2.0), 10.0, material);
    scene.spheres[1] = Sphere(vec3(10.0,80.0,-2.6), 5.0, material2);
    
    // Planes
    scene.planes[0] = Plane(normalize(vec3(0.0,0.0,1.0)), -8.0, material3);
}

//----------------------------------------------------------------------//
void main(void)
{
    Scene scene;
    createFixedScene(scene);
    Ray ray = Ray(vOrigin, normalize(vDirection));

    float tmin = -1.0;
    int indice = 0;
    int objectType = NONE;  // type de l'objet le plus proche

    // calcul de la sphere la plus proche
    Sphere nearestSphere;
    for (int i=0; i<NB_SPHERES; i++){
        Sphere sphere = scene.spheres[i];
        float t = intersectionSphere(ray, sphere);
        if (t>=0.0){
            if (tmin==-1.0 || t<tmin) {
                indice = i;
                objectType = SPHERE;
                nearestSphere = sphere;
                tmin = t;
            }
        }
    }

    // calcul du plan le plus proche
    Plane nearestPlane;
    for (int i=0; i<NB_PLANES; i++){
        Plane plane = scene.planes[i];
        float t = intersectionPlane(ray,plane);
        if (t>=0.0 && t<=FAR){
            if (tmin==-1.0 || t<tmin) {
                indice = i;
                objectType = PLANE;
                nearestPlane = plane;
                tmin = t;
            }
        }
    }

    vec3 Lo = vec3(0.0);    // par defaut la couleur est noire
    if (tmin>-1.0 && objectType!=NONE && NB_LIGHTS>0){
        RenderInfo renderinfo;
        vec3 intersection = ray.direction*tmin + ray.origin;
        vec3 wo = normalize(-ray.direction);

        // calcul du renderinfo en fonction du type de l'objet
        if (objectType==SPHERE){
            vec3 n = normalize(intersection-nearestSphere.center);
            renderinfo = RenderInfo(intersection, n, nearestSphere.material);

        } else if (objectType==PLANE) {
            renderinfo = RenderInfo(intersection, nearestPlane.normal, nearestPlane.material);

        }

        for (int i=0; i<NB_LIGHTS; i++){
            // on verifie que l'objet n'est pas cache par un autre
            if (isPointVisible(scene.lights[i], scene, renderinfo.intersection, objectType, indice)){
                Lo += apply_phong(scene.lights[i], renderinfo, wo);
            }
        }
    }
    gl_FragColor = vec4(Lo,1.0);
}