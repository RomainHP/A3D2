precision mediump float;

varying vec4 vColor;
varying vec3 vLight;

void main(void)
{
	vec2 pos = gl_PointCoord; // [0, 1]
	// si la distance avec le centre est supérieur au rayon, on ignore le fragment
	float dist = ((0.5-pos.x)*(0.5-pos.x)+(0.5-pos.y)*(0.5-pos.y));
	if (dist>(0.5*0.5))
		discard;
	// distance en fonction de la couleur
	gl_FragColor = vec4(vColor.xyz * vLight, vColor.w) * sqrt(dist);
}