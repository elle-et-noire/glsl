---
marp: true
theme: default
paginate: true
style: |
  section { font-size: 26px; place-content: start; }
  h1 { color: #2a5db0; }
  pre { font-size: 20px; }
  table { font-size: 22px; }
  section.lead { text-align: center; place-content: safe center center; }
  section.lead h1 { font-size: 64px; }
  section.dense { font-size: 22px; padding-top: 40px; }
  section.dense h1 { font-size: 40px; margin-bottom: 12px; }
  section.dense table { font-size: 20px; width: 100%; }
  section.dense th:first-child, section.dense td:first-child { white-space: nowrap; }
  section.dense th:not(:first-child) { width: 46%; }
  section.dense th, section.dense td { padding: 5px 12px; }
  section.dense pre { font-size: 19px; margin: 10px 0; }
  section.dense ul, section.dense ol { margin-top: 6px; }
  section.dense p { margin: 12px 0 0; }
  section.dense li { margin: 2px 0; }
---

<!-- _class: lead -->
<!-- _paginate: false -->

# GLSL 講習会

---

<!-- _class: dense -->

# WebGL と GLSL

```text
[CPU]  JavaScript ── WebGL（ブラウザから GPU を使うための API）を呼ぶ
         │  gl.shaderSource(shader, "precision mediump float; ...")  ← GLSL のソース（ただの文字列）
         │  gl.compileShader(shader)
         │  頂点データの転送、uniform の設定、描画命令
         ▼
       ブラウザの WebGL 実装
         │  ANGLE が GLSL を Direct3D 用の HLSL に翻訳（Windows の Chrome / Edge / Firefox）
         ▼
       GPU ドライバ（NVIDIA / AMD / Intel など）
         │  GPU 用の機械語にコンパイル
         ▼
[GPU]  頂点シェーダが頂点の位置を、フラグメントシェーダが各ピクセルの色を並列に計算 → canvas に表示
```

フラグメントシェーダ

- 1 ピクセル分の色を返す関数。512×512 の画面なら 1 フレームに約 26 万回実行される
- 入力：`gl_FragCoord`（ピクセル座標）、uniform（`time`、`mouse`、`resolution`）

---

<!-- _class: dense -->

# サンプルの使い方

https://elle-et-noire.github.io/glsl/ を開く（ブラウザだけで動く）

- 下のテキスト欄がフラグメントシェーダ。書き換えると約 0.4 秒後に画面へ反映
- 文法エラーは欄の下に赤字で表示。直すまでは直前の正しい絵が出たまま
- 「元に戻す」で元のコードに戻る。編集内容はブラウザに自動保存
- 重いときは resolution を 256 / 128 に下げる。FPS と GPU 名で環境を確認
- 各サンプルのコード先頭にある【演習】コメントが、書き換えてみる箇所

ネットがない場合：https://elle-et-noire.github.io/glsl/glsl-offline.zip を事前にダウンロードして展開し、`index.html` をダブルクリック

まず g001 を開いて、【演習】1 の `* 0.5` を変えてみる

---

<!-- _class: dense -->

# フラグメントシェーダの骨格

```glsl
precision mediump float;   // float の精度。フラグメントシェーダでは必須
uniform float time;        // JavaScript から渡される値（全ピクセル共通）
uniform vec2  mouse;       // マウス位置 0〜1（左上原点）
uniform vec2  resolution;  // 画面サイズ（px）

void main(void){           // ピクセルごとに 1 回呼ばれる
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  // このピクセルの色 RGBA（0.0〜1.0）
}
```

- `main` の中で `gl_FragColor` に色を入れれば、それが画面に出る
- 上のコードは全ピクセルが同じ赤になる。ピクセルごとに色を変えるには座標を使う

---

<!-- _class: dense -->

# 型とベクトル

| 型 | 中身 | 例 |
|---|---|---|
| `float` | 小数 | `1.0` `0.5` |
| `vec2`〜`vec4` | float を 2〜4 個まとめたもの | 座標、色 |

```glsl
float x = 1;              // エラー：整数と小数は自動変換されない。1.0 と書く
vec3 c = vec3(1.0, 0.5, 0.0);
vec4 o = vec4(c, 1.0);    // vec3 と float をつなげて vec4
vec2 v = c.xy;            // 成分の取り出し（スウィズル）。.rgb も同じ成分を指す
vec2 q = vec2(1.0, 2.0) * 2.0;   // 演算は成分ごと → (2.0, 4.0)
```

---

<!-- _class: dense -->

# 座標を -1〜1 にそろえる

```glsl
vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
```

```text
gl_FragCoord.xy (px, 左下原点)       p (中央原点)

(0,512) +--------+ (512,512)     (-1,1) +--------+ (1,1)
        |        |                      |   o    |    o = (0,0)
  (0,0) +--------+ (512,0)      (-1,-1) +--------+ (1,-1)
```

- ほぼ全サンプルの 1 行目。画面の大きさが変わっても同じ絵になる
- `p` を色にすると座標が見える：`gl_FragColor = vec4(p, 0.0, 1.0);`

---

<!-- _class: dense -->

# 時間とマウスで動かす（g002）

```glsl
vec2 m = vec2(mouse.x * 2.0 - 1.0, -mouse.y * 2.0 + 1.0);   // マウスも p と同じ -1〜1 に
float t = sin(length(m - p) * 30.0 + time * 5.0);
gl_FragColor = vec4(vec3(t), 1.0);
```

- `time`：ページを開いてからの秒数。毎フレーム増えるので、式に入れると絵が動く
- `mouse`：マウス位置。`m - p` でマウスからの向き、`length` で距離
- `sin(距離 * 30.0)`：距離に応じて明暗をくり返す → 同心円の輪
- `+ time * 5.0`：時間で位相をずらす → 輪がマウスに向かって縮んでいく

【演習】30.0（輪の間隔）、5.0（速さ）、`vec3(t)`（色）を変えてみる

---

<!-- _class: dense -->

# 距離で描く（g003, g004）

```glsl
float t = 0.1 / length(m - p);           // g003：マウスからの距離の逆数 → 光の玉
gl_FragColor = vec4(vec3(t), 1.0);
```

- `length(m - p)` は点 `m` からの距離。近いほど `t` が大きく、明るくなる
- 1.0 を超えた明るさは白に切り詰められる

```glsl
float t = 0.01 / abs(0.5 - length(p));   // 半径 0.5 の円周に近いほど明るい → 光る輪
```

- 「ある形からの距離」を計算すれば、その形を描ける
- g004 は半径 `0.5` を角度と時間で変化させて、花のような形にしている
- この「距離で形を表す」考え方を 3D に広げたのがレイマーチング

---

<!-- _class: dense -->

# レイマーチング（g008, g009）

```text
カメラ ●───────▶───────▶────▶──▶─▶ ◯ 球
       ピクセルごとにレイ（光線）の向きを決め、
       「いちばん近い物体までの距離」だけ進むことを繰り返す
```

```glsl
float distanceFunc(vec3 p){ return length(p) - 1.0; }  // 半径 1.0 の球までの距離

for(int i = 0; i < 16; i++){          // 回数は定数で決める
    distance = distanceFunc(rPos);    // いまの位置から球までの距離
    rLen += distance;                 // その分だけ進む
    rPos = cPos + ray * rLen;
}
if(abs(distance) < 0.001){ /* 球に当たった → 白 */ }
```

- 距離関数を取り替えれば、箱（g013）やトーラス（g014）も描ける

---

<!-- _class: dense -->

# 法線と光（g010）

- **法線**：表面に垂直な向き。距離関数を少しずらして差を取ると求まる

```glsl
vec3 normal = normalize(vec3(
    distanceFunc(p + vec3(d, 0.0, 0.0)) - distanceFunc(p - vec3(d, 0.0, 0.0)),
    /* y, z も同様 */ ...));
```

- **明るさ**：光の向きと法線の内積。正面から光が当たるほど 1.0 に近い

```glsl
float diff = clamp(dot(lightDir, normal), 0.1, 1.0);   // 0.1 は影側の最低の明るさ
gl_FragColor = vec4(vec3(diff), 1.0);
```

- `lightDir` を変えると光の当たる方向が変わる

---

<!-- _class: dense -->

# GLSL を Godot に持っていく

計算式はそのまま使える。変わるのは入出力の名前だけ

| このサンプル（WebGL） | Godot（`canvas_item` シェーダ） |
|---|---|
| `precision mediump float;` | `shader_type canvas_item;` |
| `void main(void)` | `void fragment()` |
| `gl_FragColor = ...` | `COLOR = ...` |
| `uniform float time;` を自分で用意 | `TIME` が最初から使える |
| `gl_FragCoord` と `resolution` から座標を作る | `UV`（0〜1）から作る |
| JavaScript で uniform を渡す | GDScript の `set_shader_parameter()` |

`ColorRect` ノードに `ShaderMaterial` を付け、`.frag` の中身を貼って上の対応どおりに書き換える

Unity は HLSL：`vec3` → `float3`、`mix` → `lerp` などの書き換えが要る（考え方は同じ）

---

<!-- _class: dense -->

# 次に学ぶ

- **残りのサンプル**：g005〜g020（フラクタル、ノイズ、回転、影）。元記事 https://wgld.org/d/glsl/
- **文法の基礎**：https://wgld.org/d/webgl/w008.html
- **作品を見る・書く**：https://www.shadertoy.com/
- **Godot**：https://docs.godotengine.org/ の Shading language

注意：WebGL 2.0 や Godot の解説は GLSL ES 3.0 の書き方

- `gl_FragColor` の代わりに `out vec4` 変数、`texture2D` の代わりに `texture` を使う
- このサンプルは WebGL 1.0（GLSL ES 1.00）
