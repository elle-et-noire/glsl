---
marp: true
theme: default
paginate: true
style: |
  section { font-size: 26px; }
  h1 { color: #2a5db0; }
  pre { font-size: 20px; }
  table { font-size: 22px; }
  section.lead { text-align: center; }
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
