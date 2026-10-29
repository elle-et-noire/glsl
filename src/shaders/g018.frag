precision mediump float;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

const vec3 cPos = vec3(0.0, 0.0, 3.0);
const vec3 cDir = vec3(0.0, 0.0, -1.0);
const vec3 cUp  = vec3(0.0, 1.0, 0.0);

const vec3 lightDir = vec3(0.577, 0.577, 0.577);

vec3 twist(vec3 p, float power){
    float s = sin(power * p.y);
    float c = cos(power * p.y);
    mat3 m = mat3(
          c, 0.0,  -s,
        0.0, 1.0, 0.0,
          s, 0.0,   c
    );
    return m * p;
}

float smoothMin(float d1, float d2, float k){
	float h = exp(-k * d1) + exp(-k * d2);
	return -log(h) / k;
}

float distFuncTorus(vec3 p, vec2 r){
	vec2 d = vec2(length(p.xy) - r.x, p.z);
	return length(d) - r.y;
}

float distFuncBox(vec3 p){
	return length(max(abs(p) - vec3(2.0, 0.1, 0.5), 0.0)) - 0.1;
}

float distFuncCylinder(vec3 p, vec2 r){
	vec2 d = abs(vec2(length(p.xy), p.z)) - r;
	return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - 0.1;
}

float distFunc(vec3 p){
	// Y 座標に応じて形状を捻る
	vec3 q = twist(p, sin(time) * 2.0);
	float d1 = distFuncTorus(q, vec2(1.5, 0.25));
	float d2 = distFuncBox(q);
	float d3 = distFuncCylinder(q, vec2(0.75, 0.25));
	return smoothMin(smoothMin(d1, d2, 16.0), d3, 16.0);
}
vec3 genNormal(vec3 p){
	float d = 0.001;
	return normalize(vec3(
		distFunc(p + vec3(  d, 0.0, 0.0)) - distFunc(p + vec3( -d, 0.0, 0.0)),
		distFunc(p + vec3(0.0,   d, 0.0)) - distFunc(p + vec3(0.0,  -d, 0.0)),
		distFunc(p + vec3(0.0, 0.0,   d)) - distFunc(p + vec3(0.0, 0.0,  -d))
	));
}

void main(void){

	vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

	vec3 cSide = cross(cDir, cUp);
	float targetDepth = 1.0;
	vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir * targetDepth);

	float tmp, dist;
	tmp = 0.0;
	vec3 dPos = cPos;
	for(int i = 0; i < 256; i++){
		dist = distFunc(dPos);
		tmp += dist;
		dPos = cPos + tmp * ray * 0.75;
	}

	vec3 color;
	if(abs(dist) < 0.001){
		vec3 normal = genNormal(dPos);
		float diff = clamp(dot(lightDir, normal), 0.1, 1.0);
		color = vec3(1.0, 1.0, 1.0) * diff;
	}else{
		color = vec3(0.0);
	}
	gl_FragColor = vec4(color, 1.0);
}
