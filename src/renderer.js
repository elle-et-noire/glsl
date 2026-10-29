import vsSource from './shaders/main.vert?raw';

// 画面全体を覆う板ポリゴンに、渡されたフラグメントシェーダを毎フレーム描画する
export function run(fsSource) {
    const c = document.getElementById('canvas');
    const check = document.getElementById('check');
    // 表示サイズは 512px 固定のまま、描画解像度だけを下げられるようにする
    c.style.width = '512px';
    c.style.height = '512px';

    const info = createInfoPanel(check.closest('p'));
    const shaderKey = location.pathname.split('/').pop().replace(/\.html$/, '');
    let savedSource = null;
    try { savedSource = localStorage.getItem(shaderKey); } catch {}
    const editor = createEditor(info.panel, savedSource ?? fsSource);

    let mx = 0.5, my = 0.5;
    c.addEventListener('mousemove', (e) => {
        const rect = c.getBoundingClientRect();
        mx = (e.clientX - rect.left) / rect.width;
        my = (e.clientY - rect.top) / rect.height;
    });

    let run = check.checked;
    let startTime = Date.now();
    let elapsed = 0;
    check.addEventListener('change', () => {
        run = check.checked;
        if (run) {
            // 停止していた時間ぶんずらして続きから再開
            startTime = Date.now() - elapsed * 1000;
            frames = 0;
            fpsTime = Date.now();
            render();
        }
    });

    const gl = c.getContext('webgl');
    if (!gl) {
        info.gpu.textContent = 'WebGL が使えません(ブラウザのハードウェアアクセラレーション設定を確認)';
        throw new Error('WebGL is not supported');
    }

    info.gpu.textContent = gpuName();
    setResolution(info.resolution.value);
    info.resolution.addEventListener('change', () => {
        setResolution(info.resolution.value);
        try { localStorage.setItem('resolution', info.resolution.value); } catch {}
    });

    // 画面全体を覆う板ポリゴン
    const position = [
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0,
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
    ];
    const index = [0, 2, 1, 1, 2, 3];

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    let vs;
    try { vs = createShader(vsSource, gl.VERTEX_SHADER); }
    catch (error) {
        editor.error.textContent = error.message;
        return;
    }
    let current = null;
    if (!activate(editor.textarea.value) && savedSource !== null) {
        const savedError = editor.error.textContent;
        activate(fsSource);
        editor.error.textContent = savedError;
    }
    if (!current) return;

    let compileTimer;
    editor.textarea.addEventListener('input', onEdit);
    editor.textarea.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return;
        event.preventDefault();
        const start = editor.textarea.selectionStart;
        const end = editor.textarea.selectionEnd;
        editor.textarea.setRangeText('    ', start, end, 'end');
        onEdit();
    });
    editor.reset.addEventListener('click', () => {
        clearTimeout(compileTimer);
        editor.textarea.value = fsSource;
        try { localStorage.removeItem(shaderKey); } catch {}
        activate(fsSource);
    });

    let frames = 0;
    let fpsTime = Date.now();
    render();

    function render() {
        if (!run) return;
        elapsed = (Date.now() - startTime) * 0.001;

        // 1 秒ごとに、その間に描けたフレーム数を表示する
        frames++;
        const now = Date.now();
        if (now - fpsTime >= 1000) {
            info.fps.textContent = (frames * 1000 / (now - fpsTime)).toFixed(1);
            frames = 0;
            fpsTime = now;
        }

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(current.uniforms.time, elapsed);
        gl.uniform2fv(current.uniforms.mouse, [mx, my]);
        gl.uniform2fv(current.uniforms.resolution, [c.width, c.height]);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.flush();

        // GPU が追いつかないと呼ばれる間隔が延びるので、FPS がそのまま重さの目安になる
        requestAnimationFrame(render);
    }

    // 描画解像度(canvas の画素数)を変える。CSS で拡大表示されるので見た目の大きさは変わらない
    function setResolution(size) {
        c.width = Number(size);
        c.height = Number(size);
        gl.viewport(0, 0, c.width, c.height);
    }

    // GPU 名を取得する。ブラウザによっては隠されていて取れない
    function gpuName() {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    }

    function onEdit() {
        try { localStorage.setItem(shaderKey, editor.textarea.value); } catch {}
        clearTimeout(compileTimer);
        compileTimer = setTimeout(() => activate(editor.textarea.value), 400);
    }

    // 成功したときだけ描画用プログラムを入れ替える
    function activate(source) {
        let next;
        try {
            const fs = createShader(source, gl.FRAGMENT_SHADER);
            let program;
            try { program = createProgram(vs, fs); }
            catch (error) {
                gl.deleteShader(fs);
                throw error;
            }
            next = {
                program, shader: fs,
                attribute: gl.getAttribLocation(program, 'position'),
                uniforms: {
                    time: gl.getUniformLocation(program, 'time'),
                    mouse: gl.getUniformLocation(program, 'mouse'),
                    resolution: gl.getUniformLocation(program, 'resolution'),
                },
            };
        } catch (error) {
            editor.error.textContent = error.message;
            return false;
        }

        if (current && current.attribute !== next.attribute && current.attribute >= 0) {
            gl.disableVertexAttribArray(current.attribute);
        }
        gl.useProgram(next.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        if (next.attribute >= 0) {
            gl.enableVertexAttribArray(next.attribute);
            gl.vertexAttribPointer(next.attribute, 3, gl.FLOAT, false, 0, 0);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        if (current) {
            gl.deleteProgram(current.program);
            gl.deleteShader(current.shader);
        }
        current = next;
        editor.error.textContent = '';
        return true;
    }

    function createShader(src, type) {
        const shader = gl.createShader(type);
        if (!shader) throw new Error('createShader failed');
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(log || 'shader compile error');
        }
        return shader;
    }

    function createProgram(vs, fs) {
        const program = gl.createProgram();
        if (!program) throw new Error('createProgram failed');
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const log = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(log || 'program link error');
        }
        return program;
    }
}

// 解像度の切り替え・FPS・GPU 名を表示する欄を、auto run の行の下に作る
function createInfoPanel(after) {
    const p = document.createElement('p');
    p.innerHTML =
        '<label>resolution <select>' +
        '<option value="512">512</option>' +
        '<option value="256">256</option>' +
        '<option value="128">128</option>' +
        '</select></label>' +
        ' / FPS <span>-</span>' +
        '<br>GPU: <span>-</span>';
    after.after(p);

    const resolution = p.querySelector('select');
    // 重い環境で下げた解像度を、他のサンプルを開いても引き継ぐ
    try { resolution.value = localStorage.getItem('resolution') ?? '512'; } catch {}
    if (!resolution.value) resolution.value = '512';

    const [fps, gpu] = p.querySelectorAll('span');
    return { panel: p, resolution, fps, gpu };
}

// シェーダの編集欄を情報欄の下に作る
function createEditor(after, source) {
    const panel = document.createElement('div');
    panel.style.width = '512px';
    panel.innerHTML = '<label>fragment shader</label><br><button type="button">元に戻す</button><pre aria-live="polite"></pre>';
    const textarea = document.createElement('textarea');
    textarea.rows = 24;
    textarea.spellcheck = false;
    textarea.wrap = 'off';
    textarea.value = source;
    textarea.style.cssText = 'display:block;box-sizing:border-box;width:100%;min-width:512px;resize:both;font-family:monospace;';
    panel.querySelector('label').after(textarea);
    const error = panel.querySelector('pre');
    error.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;color:#b00020;';
    after.after(panel);
    return { textarea, reset: panel.querySelector('button'), error };
}
