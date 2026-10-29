precision mediump float;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main(void){
    // 【演習】
    // 1. 10.0 を 5.0 にする → 羽の数が減る
    // 2. `+ time` を消す → 回転が止まる
    // 3. 0.01 を 0.03 にする → 線が太く明るくなる

    vec2 m = vec2(mouse.x * 2.0 - 1.0, -mouse.y * 2.0 + 1.0);
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    // 10.0: 羽模様の角度の周期
    float u = abs(sin((atan(p.y, p.x) - length(p) + time) * 10.0) * 0.5) + 0.2;
    float t = 0.01 / abs(u - length(p));
    gl_FragColor = vec4(vec3(t), 1.0);
}
