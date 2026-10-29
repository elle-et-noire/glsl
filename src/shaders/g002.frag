precision mediump float;
uniform float time;
uniform vec2  mouse;
uniform vec2  resolution;

void main(void){
    // 【演習】
    // 1. 30.0 を 10.0 にする → 輪の間隔が広がる
    // 2. `time * 5.0` を `time * -5.0` にする → 輪が逆向きに動く
    // 3. `vec3(t)` を `vec3(t, 0.0, 0.0)` にする → 赤い輪になる

    // マウス座標(0〜1・左上原点)を -1〜1・上がプラスに変換
    vec2 m = vec2(mouse.x * 2.0 - 1.0, -mouse.y * 2.0 + 1.0);
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    // マウスからの距離で sin 波を作り、時間で輪を動かす
    // 30.0: 輪の間隔 / 5.0: 動く速さ
    float t = sin(length(m - p) * 30.0 + time * 5.0);
    gl_FragColor = vec4(vec3(t), 1.0);
}
