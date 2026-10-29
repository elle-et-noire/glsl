precision mediump float;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

const vec3 cPos = vec3(-3.0,  3.0,  3.0);
const vec3 cDir = vec3(0.577, -0.577, -0.577);
const vec3 cUp  = vec3(0.577, 0.577, -0.577);

const vec3 lightDir = vec3(-0.577, 0.577, 0.577);

float smoothMin(float d1, float d2, float k){
	float h = exp(-k * d1) + exp(-k * d2);
	return -log(h) / k;
}

float distFuncBox(vec3 p){
	return length(max(abs(p) - vec3(2.0, 0.1, 0.5), 0.0)) - 0.1;
}

float distFuncTorus(vec3 p){
	vec2 t = vec2(1.5, 0.25);
	vec2 r = vec2(length(p.xy) - t.x, p.z);
	return length(r) - t.y;
}

float distFunc(vec3 p){
	float d1 = distFuncTorus(p);
	float d2 = distFuncBox(p);
	// 8.0: 結合部の滑らかさ
	return smoothMin(d1, d2, 8.0);
}
vec3 genNormal(vec3 p){
	float d = 0.0001;
	return normalize(vec3(
		distFunc(p + vec3(  d, 0.0, 0.0)) - distFunc(p + vec3( -d, 0.0, 0.0)),
		distFunc(p + vec3(0.0,   d, 0.0)) - distFunc(p + vec3(0.0,  -d, 0.0)),
		distFunc(p + vec3(0.0, 0.0,   d)) - distFunc(p + vec3(0.0, 0.0,  -d))
	));
}

void main(void){
	// 【演習】
	// 1. `smoothMin(d1, d2, 8.0)` の 8.0 を 2.0 にする → 大きく溶け合う(32.0 にすると境目がくっきりする)
	// 2. `smoothMin(d1, d2, 8.0)` を `min(d1, d2)` にする → ただ重ねただけになる
	// 3. トーラスの `vec2(1.5, 0.25)` を `vec2(1.5, 0.5)` にする → 輪が太くなる

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
		dPos = cPos + tmp * ray;
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
