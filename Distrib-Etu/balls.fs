precision mediump float;

varying vec4 vColor;
varying vec4 vLightSource;
varying vec4 vCoords;
varying float vRadius;
varying float vNi;
varying float vKs;
varying vec3 vLightColor;

#define M_PI   3.141592653589793

//========================================================================

float apply_cook_torrance(float ni, float sigma, vec3 wi, vec3 wo, vec3 N)
{
	vec3 m = normalize(wi+wo);	// vecteur au milieu de wo et wi
	float sigma2 = sigma*sigma;
	float ni2 = ni * ni;

	float dotin = max(0.0,dot(wi,N));
	float doton = max(0.0,dot(wo,N));
	float dotom = max(0.0,dot(wo,m));

	float dotim = max(0.0,dot(wi,m));
	float dotim2 = dotim * dotim;

	float cosTm = max(0.0,dot(N,m));
	float cosTm2 = cosTm*cosTm;
	float cosTm4 = cosTm2*cosTm2;

	float tanTm2 = (1.0-cosTm2)/cosTm2;

	float g = sqrt(ni2 + dotim2 - 1.0);
	float gpc = g + dotim;
	float gmc = g - dotim;
	float cgpc = dotim * gpc - 1.0;
	float cgmc = dotim * gmc + 1.0;

	float F = 0.0;	// facteur de fresnel
	if (gpc!=0.0 && cgmc!=0.0){
		F = (gmc*gmc)/(2.0*gpc*gpc) * (1.0 + (cgpc*cgpc)/(cgmc*cgmc));
	}
	
	float G = 0.0;	// ombrage et masquage
	if (dotom!=0.0 && dotim!=0.0) {
		G = min( 1.0, min( (2.0*cosTm*doton)/dotom, (2.0*cosTm*dotin)/dotim ));
	}

	float D = 0.0;	// distribution de Beckmann
	float sigCos = M_PI*sigma2*cosTm4;
	if (sigCos!=0.0){
		D = exp(-tanTm2/(2.0*sigma2))/sigCos;
	}	

	float fs = F*D*G/(4.0*dotin*doton);
	return fs;
}

//========================================================================

void main(void)
{
	float sigma = vColor.w;
	vec3 Li = vLightColor * 3.0;	// Lumiere incidente
	vec3 kd = vColor.xyz;
	float ks = 0.5;

	vec2 pos = gl_PointCoord; // [0, 1]

	// si la distance avec le centre est supérieur au rayon, on ignore le fragment
	float dist = ((0.5-pos.x)*(0.5-pos.x)+(0.5-pos.y)*(0.5-pos.y));
	if (dist>(0.5*0.5))
		discard;

	// calcul de la normale
	float z = sqrt((0.5*0.5) - dist);
	vec3 ps = vec3(pos.x,pos.y,z);	// coordonnees du point dans le fragment
	vec3 N = normalize(ps-vec3(0.5,0.5,0.0));
	N.y = - N.y;	// inversion de l'axe y car le repere camera est un repere main gauche

	// point dans le repere 3D
	vec3 point3D = vCoords.xyz + vRadius * N;

	// calcul de la lumiere
	vec3 wi = normalize(vLightSource.xyz-point3D);

	// calcul de la specularite (cook torrance)
	vec3 CT = vec3(apply_cook_torrance(vNi, sigma, wi, normalize(vec3(0.0)-point3D), N));

	// couleur en fonction de l'intensite lumineuse
	float cosTi = max(0.0,dot(wi,N));
	vec3 Lo = Li * (kd/M_PI + vKs*CT) * cosTi;	// lambert + cook torrance
	gl_FragColor = vec4(Lo,1.0);
}



