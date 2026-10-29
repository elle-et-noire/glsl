precision mediump float;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main(void){
    // 【演習】
    // 1. 0.1 を 0.3 にする → 光の玉が大きくなる
    // 2. `vec3(t)` を `vec3(t * 0.2, t * 0.5, t)` にする → 青い光になる
    // 3. `float t = ...;` の次の行に `t += 0.1 / length(-m - p);` を足す → 反対側にもう 1 つ光が出る

    vec2 m = vec2(mouse.x * 2.0 - 1.0, -mouse.y * 2.0 + 1.0);
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    // 0.1: 光の玉の大きさ
    float t = 0.1 / length(m - p);
    gl_FragColor = vec4(vec3(t), 1.0);
}
