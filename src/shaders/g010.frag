precision mediump float;
uniform float time;
uniform vec2  mouse;
uniform vec2  resolution;

const float sphereSize = 1.0;
const vec3 lightDir = vec3(-0.577, 0.577, 0.577);

float distanceFunc(vec3 p){
	return length(p) - sphereSize;
}

vec3 getNormal(vec3 p){
	// 微小な差分から法線を求める
	float d = 0.0001;
	return normalize(vec3(
		distanceFunc(p + vec3(  d, 0.0, 0.0)) - distanceFunc(p + vec3( -d, 0.0, 0.0)),
		distanceFunc(p + vec3(0.0,   d, 0.0)) - distanceFunc(p + vec3(0.0,  -d, 0.0)),
		distanceFunc(p + vec3(0.0, 0.0,   d)) - distanceFunc(p + vec3(0.0, 0.0,  -d))
	));
}

void main(void){
	// 【演習】
	// 1. `lightDir` を `vec3(0.577, 0.577, 0.577)` にする → 光が右上から当たる
	// 2. `clamp(..., 0.1, 1.0)` の 0.1 を 0.0 にする → 影側が真っ黒になる
	// 3. `gl_FragColor = vec4(vec3(diff), 1.0);` を `gl_FragColor = vec4(normal, 1.0);` にする → 法線の向きが色で見える

	vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

	vec3 cPos = vec3(0.0,  0.0,  2.0);
	vec3 cDir = vec3(0.0,  0.0, -1.0);
	vec3 cUp  = vec3(0.0,  1.0,  0.0);
	vec3 cSide = cross(cDir, cUp);
	float targetDepth = 1.0;

	vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir * targetDepth);

	float distance = 0.0;
	float rLen = 0.0;
	vec3  rPos = cPos;
	for(int i = 0; i < 16; i++){
		distance = distanceFunc(rPos);
		rLen += distance;
		rPos = cPos + ray * rLen;
	}

	if(abs(distance) < 0.001){
		vec3 normal = getNormal(rPos);
		float diff = clamp(dot(lightDir, normal), 0.1, 1.0);
		gl_FragColor = vec4(vec3(diff), 1.0);
	}else{
		gl_FragColor = vec4(vec3(0.0), 1.0);
	}
}
