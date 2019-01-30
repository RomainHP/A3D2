precision mediump float;

uniform float uRandom;
uniform sampler2D uTex;
uniform float uNbRays;

varying vec3 vOrigin;
varying vec3 vDirection;
varying vec2 vTexCoord;

//----------------------------------------------------------------------//
#define M_PI            3.141592653589793
#define FAR             1000.0

#define NB_REBONDS      2

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
float rand(vec2 co)
{
    return fract(sin(dot(co.xy * uRandom,vec2(12.9898,78.233))) * 43758.5453);
}

//----------------------------------------------------------------------//
Sphere getSphere(in Scene scene, int indice)
{
    for(int i=0; i<NB_SPHERES; i++){
        if(i==indice){
            return scene.spheres[i];
        }	
    }
}

//----------------------------------------------------------------------//
Plane getPlane(in Scene scene, int indice)
{
    for(int i=0; i<NB_PLANES; i++){
        if(i==indice){
            return scene.planes[i];
        }	
    }
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
vec3 apply_phong(in RenderInfo renderinfo, in vec3 wi, in vec3 wo)
{
    vec3 lambert = renderinfo.material.kd/M_PI;

    vec3 h = normalize(wi+wo);
    float cosAlpha = max(0.0,dot(renderinfo.normal,h));

    // formule de phong modifie
    vec3 brdf = lambert + vec3(renderinfo.material.ks) * (renderinfo.material.n+8.0)/(8.0*M_PI) * pow(cosAlpha,renderinfo.material.n);

    return brdf;
}

//----------------------------------------------------------------------//
int intersection(in Scene scene, in Ray ray, out RenderInfo renderinfo)
{
    // Par défaut aucun objet n'est touché
    renderinfo.objectType = NONE;

    float tmin = -1.0;
    int indice = -1;

    // calcul de la sphere la plus proche
    for (int i=0; i<NB_SPHERES; i++){
        Sphere sphere = scene.spheres[i];
        float t = intersectionSphere(ray, sphere);
        if (t>=0.0){
            if (tmin==-1.0 || t<tmin) {
                indice = i;
                renderinfo.objectType = SPHERE;
                tmin = t;
            }
        }
    }

    // calcul du plan le plus proche
    for (int i=0; i<NB_PLANES; i++){
        Plane plane = scene.planes[i];
        float t = intersectionPlane(ray,plane);
        if (t>=0.0 && t<=FAR){
            if (tmin==-1.0 || t<tmin) {
                indice = i;
                renderinfo.objectType = PLANE;
                tmin = t;
            }
        }
    }

    vec3 intersection = ray.direction*tmin + ray.origin;
    renderinfo.intersection = intersection;

    return indice;
}

//----------------------------------------------------------------------//
// bool isPointVisible(in Light light, in Scene scene, in vec3 point)
// {
//     vec3 pointLight = point-light.position; // vecteur entre la source de lumiere et le point
//     // on lance un rayon depuis la source de lumiere jusqu'au point en question
//     Ray rayLight = Ray(light.position, normalize(pointLight));
//     float normPoint = (pointLight.x)*(pointLight.x)+(pointLight.y)*(pointLight.y);

//     RenderInfo renderinfo;
//     int indice = intersection(scene, rayLight, renderinfo);
//     if (indice>-1 && renderinfo.objectType!=NONE){
//         pointLight = renderinfo.intersection-light.position;
//         float norm = (pointLight.x)*(pointLight.x)+(pointLight.y)*(pointLight.y);
//         return (normPoint<norm);
//     }

//     return true;
// }

//----------------------------------------------------------------------//
bool isPointVisible(in Light light, in Scene scene, in vec3 point)
{
    vec3 pointLight = point-light.position; // vecteur entre la source de lumiere et le point
    // on lance un rayon depuis la source de lumiere jusqu'au point en question
    Ray rayLight = Ray(light.position, normalize(pointLight));
    float normPoint = (pointLight.x)*(pointLight.x)+(pointLight.y)*(pointLight.y);
    // on teste pour chaque sphere si le rayon intersecte l'objet
    for (int i=0; i<NB_SPHERES; i++){
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
vec3 launch_ray(in Scene scene, in Ray ray, out RenderInfo renderinfo)
{
    vec3 Lo = vec3(0.0);    // par defaut la couleur est noire

    int indice = intersection(scene, ray, renderinfo);

    if (indice>-1 && renderinfo.objectType!=NONE && NB_LIGHTS>0){
        vec3 wo = normalize(ray.origin - renderinfo.intersection);
        // calcul du renderinfo en fonction du type de l'objet
        if (renderinfo.objectType==SPHERE){
            Sphere nearestSphere = getSphere(scene, indice);
            vec3 n = normalize(renderinfo.intersection-nearestSphere.center);
            renderinfo.material = nearestSphere.material;
            renderinfo.normal = n;
        } else if (renderinfo.objectType==PLANE) {
            Plane nearestPlane = getPlane(scene, indice);
            renderinfo.material = nearestPlane.material;
            renderinfo.normal = nearestPlane.normal;
        }
        renderinfo.intersection += renderinfo.normal * 0.001;

        for (int i=0; i<NB_LIGHTS; i++){
            // on verifie que l'objet n'est pas cache par un autre
            if (isPointVisible(scene.lights[i], scene, renderinfo.intersection)){
                vec3 wi = normalize(scene.lights[i].position-renderinfo.intersection);
                float cosTi = max(0.0,dot(wi,renderinfo.normal));
                Lo += scene.lights[i].power * apply_phong(renderinfo, wi, wo) * cosTi;
            }
        }
    }

    return Lo;
}

//----------------------------------------------------------------------//
vec3 getIndirectLight(in Scene scene, in RenderInfo renderinfo)
{
    vec3 Loi = vec3(0.0);
    Data data;
    Ray ray;

    if (NB_REBONDS<=0) return Loi;

    // pour recuperer le renderinfo precedent
    RenderInfo previousRenderInfo = renderinfo;
    
    for (int k=0; k<NB_REBONDS; k++) {
        // si aucun objet n'est touche, on arrete
        if (previousRenderInfo.objectType==NONE) break;
        if (k>0) previousRenderInfo = data.renderinfo[k-1];
        // rotation dans la demi-sphere exterieure
        vec3 vecTmp = vec3(1.0,0.0,0.0);
        if (abs(dot(vecTmp,renderinfo.normal))>1.0-0.001){
            vecTmp = vec3(0.0,1.0,0.0); // si les vecteurs sont colineaires
        }
        vec3 i = cross(renderinfo.normal, vecTmp);
        vec3 j = cross(renderinfo.normal, i);
        mat3 rotation = mat3(i, j, previousRenderInfo.normal);
        // on genere 2 nombres aleatoires pour lancer un rayon dans une direction au hasard
        float rand1 = rand(float(k+1)*previousRenderInfo.intersection.xy*previousRenderInfo.intersection.yz);
        float rand2 = rand(float(k+1)*previousRenderInfo.intersection.yz*previousRenderInfo.intersection.xz);
        float phi = rand2 * 2.0 * M_PI;
        // genere un point aleatoire sur la sphere
        float x = cos(phi) * sqrt(1.0-rand1*rand1);
        float y = sin(phi) * sqrt(1.0-rand1*rand1);
        float z = rand1;
        vec3 direction = rotation * vec3(x, y, z);
        // lancer de rayon depuis le point d'intersection
        ray.origin = previousRenderInfo.intersection;
        ray.direction = normalize(direction);
        data.Lo[k] = launch_ray(scene, ray, data.renderinfo[k]);
        data.wo[k] = - ray.direction;
    }

    // On ajoute la lumiere directe de k+1 a celle de k
    for (int k=NB_REBONDS-2; k>=0; k--) {
        if (data.renderinfo[k+1].objectType != NONE) {
            vec3 wo = data.wo[k];
            vec3 wi = normalize(data.renderinfo[k+1].intersection - data.renderinfo[k].intersection);
            float cosTi = max(0.0,dot(wi, data.renderinfo[k].normal));
            data.Lo[k] += data.Lo[k+1] * apply_phong(data.renderinfo[k], wi, wo) * cosTi;
        }
    }

    vec3 wo = normalize(- vDirection);
    vec3 wi = normalize(data.renderinfo[0].intersection-renderinfo.intersection);
    float cosTi = max(0.0,dot(wi,renderinfo.normal));
    Loi += data.Lo[0] * apply_phong(renderinfo, wi, wo) * cosTi;

    return Loi;
}

//----------------------------------------------------------------------//
void createFixedScene(out Scene scene)
{
    // Materials
    Material material1 = Material(vec3(0.9,0.1,0.1), 0.2, 50.0);
    Material material2 = Material(vec3(0.1,0.1,0.9), 0.9, 20.0);
    Material material3 = Material(vec3(0.1,0.9,0.9), 0.9, 2.0);
    Material material4 = Material(vec3(0.9,0.9,0.9), 0.2, 5.0);
    Material material5 = Material(vec3(0.1,0.1,0.9), 0.2, 5.0);

    // Lights
    scene.lights[0] = Light(vec3(0.0,180.0,5.0), vec3(2.0,2.0,2.0));
    //scene.lights[1] = Light(vec3(50.0,20.0,30.0), vec3(0.1,0.1,0.7));

    // Spheres
    scene.spheres[0] = Sphere(vec3(0.0,180.0,5.0), 10.0, material1);
    //scene.spheres[1] = Sphere(vec3(-10.0,55.0,-7.0), 3.0, material2);
    //scene.spheres[2] = Sphere(vec3(10.0,80.0,-5.0), 5.0, material3);
    
    // Planes
    scene.planes[0] = Plane(normalize(vec3(0.0,0.0,1.0)), 10.0, material5);
    scene.planes[1] = Plane(normalize(vec3(0.0,-1.0,0.0)), 200.0, material4);
}

//----------------------------------------------------------------------//
void main(void)
{
    Scene scene;
    createFixedScene(scene);

    RenderInfo renderinfo;
    Ray ray = Ray(vOrigin, normalize(vDirection));

    vec3 color = vec3(0.0);
    vec3 Lo = launch_ray(scene, ray, renderinfo);   // eclairement direct
    vec3 Loi = getIndirectLight(scene, renderinfo); // eclairement indirect
    //Loi = vec3(0.01);

    if (uNbRays==1.0) {
        color = Lo;
    } else {
        float oldPart = (uNbRays - 1.0) / uNbRays;
        float newPart = 1.0 / uNbRays;
        vec3 oldColor = texture2D(uTex, vTexCoord).rgb * oldPart; // lecture dans texIN
        vec3 newColor = Loi * newPart;
        color = oldColor + newColor;
    }

    // Loi *= 2.0 * M_PI / float(1);

    gl_FragColor = vec4(color, 1.0);
}