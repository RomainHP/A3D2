precision mediump float;

varying vec3 vOrigin;
varying vec3 vDirection;
varying float vRandom;

//----------------------------------------------------------------------//
#define M_PI            3.141592653589793
#define NEAR            50.0
#define FAR             1000.0

#define NB_REBONDS      5
#define NB_DIR          1

#define NB_LIGHTS       1
#define NB_SPHERES      1
#define NB_PLANES       2

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
    int objectType;
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
struct Data
{
    vec3[NB_REBONDS] Lo;
    vec3[NB_REBONDS] wo;
    RenderInfo[NB_REBONDS] renderinfo;
};

//----------------------------------------------------------------------//
float rand(vec3 co)
{
    return fract(sin(dot(co.xy * vRandom,vec2(12.9898,78.233))) * 43758.5453);
}

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
    float num = - plane.scal - dot(ray.origin,plane.normal);
    float denom = dot(ray.direction, plane.normal);
    float t = num/denom;
    if (t>FAR) {
        t = -1.0;
    }
    return t;
}

//----------------------------------------------------------------------//
bool isPointVisible(in Light light, in Scene scene, in vec3 point, in int objType, in int indice)
{
    vec3 pointLight = point-light.position; // vecteur entre la source de lumiere et le point
    // on lance un rayon depuis la source de lumiere jusqu'au point en question
    Ray rayLight = Ray(light.position, normalize(pointLight));
    float normPoint = (pointLight.x)*(pointLight.x)+(pointLight.y)*(pointLight.y);
    // on teste pour chaque sphere si le rayon intersecte l'objet
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
                // si la distance du point est inferieur alors il cache le point que l'on teste
                return false;
            }
        }
    }
    // on fait la meme chose avec les plans
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
                // si la distance du point est inferieur alors il cache le point que l'on teste
                return false;
            }
        }
    }
    return true;
}

//----------------------------------------------------------------------//
vec3 apply_phong(in RenderInfo renderinfo, in vec3 wi, in vec3 wo)
{
    vec3 h = normalize(wi+wo);
    float cosAlpha = max(0.0,dot(renderinfo.normal,h));

    // formule de phong modifie
    vec3 brdf = renderinfo.material.kd/M_PI + vec3(renderinfo.material.ks) * (renderinfo.material.n+8.0)/(8.0*M_PI) * pow(cosAlpha,renderinfo.material.n);

    return brdf;
}

//----------------------------------------------------------------------//
vec3 launch_ray(in Scene scene, in Ray ray, out RenderInfo renderinfo)
{
    renderinfo = RenderInfo(NONE, vec3(0.0), vec3(0.0), Material(vec3(0.0),0.0,0.0));
    
    vec3 Lo = vec3(0.0);    // par defaut la couleur est noire

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

    if (tmin>-1.0 && objectType!=NONE && NB_LIGHTS>0){
        vec3 intersection = ray.direction*tmin + ray.origin;
        vec3 wo = normalize(-ray.direction);

        // calcul du renderinfo en fonction du type de l'objet
        if (objectType==SPHERE){
            vec3 n = normalize(intersection-nearestSphere.center);
            renderinfo = RenderInfo(SPHERE, intersection, n, nearestSphere.material);
        } else if (objectType==PLANE) {
            renderinfo = RenderInfo(PLANE, intersection, nearestPlane.normal, nearestPlane.material);
        }

        for (int i=0; i<NB_LIGHTS; i++){
            // on verifie que l'objet n'est pas cache par un autre
            if (isPointVisible(scene.lights[i], scene, renderinfo.intersection, objectType, indice)){
                vec3 wi = normalize(scene.lights[i].position-renderinfo.intersection);
                float cosTi = max(0.0,dot(wi,renderinfo.normal));
                Lo += scene.lights[i].power * apply_phong(renderinfo, wi, wo) * cosTi;
            }
        }
    }

    return Lo;
}

//----------------------------------------------------------------------//
void createFixedScene(out Scene scene)
{
    // Materials
    Material material1 = Material(vec3(0.9,0.1,0.1), 0.2, 50.0);
    Material material2 = Material(vec3(0.1,0.1,0.9), 0.9, 20.0);
    Material material3 = Material(vec3(0.1,0.9,0.9), 0.9, 2.0);
    Material material4 = Material(vec3(0.9,0.9,0.9), 0.2, 5.0);

    // Lights
    scene.lights[0] = Light(vec3(0.0,90.0,30.0), vec3(2.0,2.0,2.0));
    //scene.lights[1] = Light(vec3(50.0,20.0,30.0), vec3(1.0,0.1,1.0));

    // Spheres
    scene.spheres[0] = Sphere(vec3(0.0,100.0,5.0), 10.0, material1);
    //scene.spheres[1] = Sphere(vec3(-10.0,55.0,-7.0), 3.0, material2);
    //scene.spheres[2] = Sphere(vec3(10.0,80.0,-5.0), 5.0, material3);
    
    // Planes
    scene.planes[0] = Plane(normalize(vec3(0.0,0.0,1.0)), 10.0, material4);
    scene.planes[1] = Plane(normalize(vec3(0.0,-1.0,0.0)), 200.0, material4);
}

//----------------------------------------------------------------------//
void main(void)
{
    vec3 Lo = vec3(0.0);

    Scene scene;
    createFixedScene(scene);

    RenderInfo renderinfo;
    Ray ray = Ray(vOrigin, normalize(vDirection));
    Lo += launch_ray(scene, ray, renderinfo);   // eclairement direct

    // eclairement indirect
    vec3 Loi = vec3(0.0);
    Data data;
    for (int k=0; k<NB_REBONDS; k++) {
        if (renderinfo.objectType==NONE) {
            break;
        }
        vec3 vecTmp = vec3(1.0,0.0,0.0);
        if (dot(vecTmp,renderinfo.normal)==0.0){
            vecTmp = vec3(0.0,1.0,0.0);
        }
        vec3 i = cross(renderinfo.normal, vecTmp);
        vec3 j = cross(renderinfo.normal, i);
        mat3 rotation = mat3(i, j, renderinfo.normal);
        float theta = acos(rand(renderinfo.intersection));
        float phi = rand(renderinfo.intersection) * 2.0 * M_PI;
        // vecteur direction en fonction de phi et theta
        float x = sin(theta) * cos(phi);
        float y = sin(theta) * sin(phi);
        float z = cos(theta);
        vec3 direction = rotation * (vec3(x, y, z) - renderinfo.intersection);
        // lancer de rayon depuis le point d'intersection
        ray = Ray(renderinfo.intersection, normalize(direction));   
        data.Lo[k] = launch_ray(scene, ray, renderinfo);
        data.wo[k] = normalize(- ray.direction);
        data.renderinfo[k] = renderinfo;
    }

    for (int k=NB_REBONDS-2; k>=0; k--) {
        vec3 wo = data.wo[k];
        vec3 wi = normalize(data.renderinfo[k+1].intersection-data.renderinfo[k].intersection);
        float cosTi = max(0.0,dot(wi,data.renderinfo[k].normal));
        data.Lo[k] += data.Lo[k+1] * apply_phong(data.renderinfo[k], wi, wo) * cosTi;
    }

    Loi = data.Lo[0];
    Loi *= 2.0 * M_PI / float(NB_DIR);

    gl_FragColor = vec4(Lo+Loi,1.0);
}