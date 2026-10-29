precision mediump float;
uniform float time;
uniform vec2  mouse;
uniform vec2  resolution;

vec3 hsv(float h, float s, float v){
	vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
	return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}

void main(void){
	// 【演習】
	// 1. for 文の 360 と `float(j) / 360.0` の 360 を両方 50 にする → 模様が粗くなる
	// 2. ジュリア集合にする:`vec2 z = p;` にし、ループ内の `+ x * y` を `+ vec2(-0.345, 0.654)` にする(g006 と同じ形)

	vec2 m = vec2(mouse.x * 2.0 - 1.0, -mouse.y * 2.0 + 1.0);

	vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

	// 360 回まで反復し、発散の速さで色を決める
	int j = 0;
	vec2  x = p + vec2(-0.5, 0.0);
	float y = 1.5 - mouse.x * 0.5;
	vec2  z = vec2(0.0, 0.0);

	for(int i = 0; i < 360; i++){
		j++;
		if(length(z) > 2.0){break;}
		z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + x * y;
	}

	float h = mod(time * 20.0, 360.0) / 360.0;
	vec3 rgb = hsv(h, 1.0, 1.0);

	float t = float(j) / 360.0;

	gl_FragColor = vec4(rgb * t, 1.0);

}
