precision mediump float;

varying vec4 vColor;
varying vec4 vLightSource;
varying vec4 vCoords;
varying float vRadius;

#define M_PI   3.141592653589793

//========================================================================

vec3 apply_lambert(vec3 li, vec3 kd, vec3 light, vec3 wi)
{
	float cosTheta = dot(light,wi)/(length(light),length(wi));
	// formule de lambert
	vec3 l0 = li * (kd/M_PI) * cosTheta;
	return l0;
}

//========================================================================

// diapo 31 du cours
float apply_cook_torrance(float ni, float sigma, vec3 wo, vec3 wi, vec3 normal)
{
	vec3 m = (wi+wo)/abs(wi+wo);	// vecteur au milieu de wo et wi
	float theta_m = acos(dot(wo,m)/(length(wo)*length(m)));	// angle entre wo et m
	float c = abs(dot(wi,m));
	float g2 = sqrt(ni*ni + c*c - 1.0);
	// f = facteur de fresnel
	float f = 0.5 * pow(g2-c,2.0)/pow(g2+c,2.0) * (1.0 + (pow(c*(g2+c)-1.0,2.0)/pow(c*(g2-c)+1.0,2.0)));
	// d = distribution beckmann
	float d = 1.0 / (M_PI*pow(theta_m,2.0)*pow(cos(theta_m),4.0)) * exp(- pow(tan(theta_m),2.0)/(2.0*pow(theta_m,2.0)));
	// g = ombrage et masquage
	float g = min(1.0, min((2.0*dot(normal,m)*dot(normal,wo))/dot(wo,m), (2.0*dot(normal,m)*dot(normal,wi))/dot(wi,m)));
	float fs = (f*d*g) / (4.0 * abs(dot(wi,normal)) * abs(dot(wo,normal)));
	return fs;
}

//========================================================================

void main(void)
{
	float ni = 1.5;	// indice de refraction
	vec3 lightIntensity = vec3(2.0);

	vec2 pos = gl_PointCoord; // [0, 1]

	// si la distance avec le centre est supérieur au rayon, on ignore le fragment
	float dist = ((0.5-pos.x)*(0.5-pos.x)+(0.5-pos.y)*(0.5-pos.y));
	if (dist>(0.5*0.5))
		discard;

	// calcul de la normale
	float z = sqrt((0.5*0.5) - dist);
	vec3 ps = vec3(pos.x,pos.y,z);	// coordonnees du point dans le fragment
	vec3 n = normalize(ps-vec3(0.5,0.5,0.0));
	n.y = - n.y;	// inversion de l'axe y car le repere camera est un repere main gauche

	// point dans le repere 3D
	vec3 point3D = vCoords.xyz + vRadius * n;

	// calcul de la lumiere
	vec3 light = normalize(vLightSource.xyz-point3D);

	vec3 l0 = apply_lambert(lightIntensity, vColor.xyz, light, n);
	vec3 fs = vec3(apply_cook_torrance(ni, vColor.w, point3D, light, n));

	// couleur en fonction de l'intensite lumineuse
	gl_FragColor = vec4(l0+fs, 1.0);
}