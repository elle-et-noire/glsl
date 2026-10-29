precision mediump float;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main(void){
    vec2 m = vec2(mouse.x * 2.0 - 1.0, -mouse.y * 2.0 + 1.0);
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    // 10.0: 羽模様の角度の周期
    float u = abs(sin((atan(p.y, p.x) - length(p) + time) * 10.0) * 0.5) + 0.2;
    float t = 0.01 / abs(u - length(p));
    gl_FragColor = vec4(vec3(t), 1.0);
}
