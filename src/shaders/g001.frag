precision mediump float;
uniform float time;
uniform vec2  mouse;
uniform vec2  resolution;

void main(void){
    // 【演習】
    // 1. `* 0.5` を `* 1.0` にする → 色が濃くなる
    // 2. `0.05 / length(p - m)` の 0.05 を 0.2 にする → マウスの光が大きくなる
    // 3. `vec3(color, 0.0)` を `vec3(0.0, color)` にする → 色の組み合わせが変わる

    // ピクセル座標を中心原点・短辺基準の -1〜1 に正規化
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    // -1〜1 を 0〜1 に写して色にする
    vec2 color = (vec2(1.0) + p) * 0.5;
    // マウス座標(0〜1・左上原点)を p と同じ座標系に変換
    vec2 m = (vec2(mouse.x, 1.0 - mouse.y) * 2.0 * resolution - resolution) / min(resolution.x, resolution.y);
    // マウスに近いほど明るくする
    float light = 0.05 / length(p - m);
    gl_FragColor = vec4(vec3(color, 0.0) + light, 1.0);
}
