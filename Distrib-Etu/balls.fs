precision mediump float;

varying vec3 vColor;
varying vec4 vLightSource;
varying vec4 vCoords;
varying float vRadius;
varying float vNi;
varying float vKs;
varying float vSigma;
varying float vModeBrdf;
varying vec3 vLightColor;

#define M_PI   3.141592653589793

//========================================================================

float apply_cook_torrance(float ni, float sigma, vec3 wi, vec3 wo, vec3 N)
{
	vec3 m = normalize(wi+wo);	// vecteur au milieu de wo et wi
	float sigma2 = sigma*sigma;
	float ni2 = ni * ni;

	// dotin = cos de l'angle entre i et n
	float dotin = max(0.0,dot(wi,N));
	float doton = max(0.0,dot(wo,N));
	float dotom = max(0.0,dot(wo,m));

	float dotim = max(0.0,dot(wi,m));
	float dotim2 = dotim * dotim;

	float dotnm = max(0.0,dot(N,m));
	float dotnm2 = dotnm*dotnm;
	float dotnm4 = dotnm2*dotnm2;

	float tannm2 = (1.0-dotnm2)/dotnm2;

	// variables pour calculer fresnel
	float g = sqrt(ni2 + dotim2 - 1.0);
	float gpc = g + dotim;
	float gmc = g - dotim;
	float cgpc = dotim * gpc - 1.0;
	float cgmc = dotim * gmc + 1.0;

	// la variable vaut 0 s'il y a une division par 0

	float G = 0.0;	// ombrage et masquage
	if (dotom!=0.0 && dotim!=0.0) {
		G = min( 1.0, min( (2.0*dotnm*doton)/dotom, (2.0*dotnm*dotin)/dotim ));
	}	

	if (doton==0.0) {
		return G;	// si l'angle entre o et n est nul, on retourne G pour conserver le degrade
	}

	float F = 0.0;	// facteur de fresnel
	if (gpc!=0.0 && cgmc!=0.0){
		F = (gmc*gmc)/(2.0*gpc*gpc) * (1.0 + (cgpc*cgpc)/(cgmc*cgmc));
	}

	float D = 0.0;	// distribution de Beckmann
	float sigCos = M_PI*sigma2*dotnm4;
	if (sigCos!=0.0){
		D = exp(-tannm2/(2.0*sigma2))/sigCos;
	}

	float fs = F*D*G/(4.0*dotin*doton);	// formule de cook-torrance
	return fs;	
}

//========================================================================

void main(void)
{
	vec3 Lo = vColor;	// par defaut : pas de brdf donc seulement la couleur

	vec2 pos = gl_PointCoord; // [0, 1]

	// si la distance avec le centre est supérieur au rayon, on ignore le fragment
	float dist = ((0.5-pos.x)*(0.5-pos.x)+(0.5-pos.y)*(0.5-pos.y));
	if (dist>(0.5*0.5))
		discard;

	if (vModeBrdf!=0.0) {	// si mode == 0.0 alors pas de brdf

		vec3 Li = vLightColor * 3.0;	// Lumiere incidente
		vec3 kd = vColor;

		// calcul de la normale
		float z = sqrt((0.5*0.5) - dist);
		vec3 ps = vec3(pos.x,pos.y,z);	// coordonnees du point dans le fragment
		vec3 N = normalize(ps-vec3(0.5,0.5,0.0));
		N.y = - N.y;	// inversion de l'axe y car le repere camera est un repere main gauche

		// point dans le repere 3D
		vec3 point3D = vCoords.xyz + vRadius * N;

		// calcul de la lumiere
		vec3 wi = normalize(vLightSource.xyz-point3D);

		float cosTi = max(0.0,dot(wi,N));	// angle entre i et N necessaire pour les brdfs

		// couleur en fonction de l'intensite lumineuse

		if (vModeBrdf==1.0){	// Lambert

			Lo = Li * kd/M_PI * cosTi;

		} else if (vModeBrdf==2.0){	// Lambert + Cook-Torrance

			vec3 wo = normalize(vec3(0.0)-point3D);

			// calcul de la specularite (cook torrance)
			vec3 CT = vec3(apply_cook_torrance(vNi, vSigma, wi, wo, N));

			Lo = Li * (kd/M_PI + vKs*CT) * cosTi;
		}
	}

	gl_FragColor = vec4(Lo,1.0);
}



