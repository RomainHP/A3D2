precision mediump float;

varying vec4 vColor;
varying vec4 vLightSource;
varying vec4 vCoords;
varying float vRadius;
varying float vBrdfModel;

void main(void)
{
	vec2 pos = gl_PointCoord; // [0, 1]

	// si la distance avec le centre est supérieur au rayon, on ignore le fragment
	float dist = ((0.5-pos.x)*(0.5-pos.x)+(0.5-pos.y)*(0.5-pos.y));
	if (dist>(0.5*0.5))
		discard;

	// calcul de la normale
	float z = sqrt((0.5*0.5) - dist);
	vec3 ps = vec3(pos.x,pos.y,z);	// coordonnees du point dans le fragment
	vec3 n = normalize(ps-vec3(0.5,0.5,0.0));

	// point dans le repere 3D
	vec3 point3D = vCoords.xyz + vRadius * n;

	// calcul de la lumiere
	vec3 light = normalize(vLightSource.xyz-point3D);
	light.y = - light.y;

	// intensite lumineuse en fonction du brdf
	float intensity = 1.0;
	if (vBrdfModel==1.0) {	// Lambert
		intensity = dot(light,n);
	} else if (vBrdfModel==2.0) {	// Cook Torrance
		
	} else {
		
	}

	// couleur en fonction de l'intensite lumineuse
	gl_FragColor = vec4(vColor.xyz * intensity, vColor.w);
}