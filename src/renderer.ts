import vsSource from './shaders/main.vert?raw';

// 画面全体を覆う板ポリゴンに、渡されたフラグメントシェーダを毎フレーム描画する
export function run(fsSource: string): void {
    const c = document.getElementById('canvas') as HTMLCanvasElement;
    const check = document.getElementById('check') as HTMLInputElement;
    c.width = 512;
    c.height = 512;

    let mx = 0.5, my = 0.5;
    c.addEventListener('mousemove', (e) => {
        const rect = c.getBoundingClientRect();
        mx = (e.clientX - rect.left) / c.width;
        my = (e.clientY - rect.top) / c.height;
    });

    let run = check.checked;
    let startTime = Date.now();
    let elapsed = 0;
    check.addEventListener('change', () => {
        run = check.checked;
        if (run) {
            // 停止していた時間ぶんずらして続きから再開
            startTime = Date.now() - elapsed * 1000;
            render();
        }
    });

    const ctx = c.getContext('webgl');
    if (!ctx) throw new Error('WebGL is not supported');
    const gl: WebGLRenderingContext = ctx;

    const prg = createProgram(
        createShader(vsSource, gl.VERTEX_SHADER),
        createShader(fsSource, gl.FRAGMENT_SHADER));

    const uniLocation = {
        time: gl.getUniformLocation(prg, 'time'),
        mouse: gl.getUniformLocation(prg, 'mouse'),
        resolution: gl.getUniformLocation(prg, 'resolution'),
    };

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
    const attLocation = gl.getAttribLocation(prg, 'position');
    gl.enableVertexAttribArray(attLocation);
    gl.vertexAttribPointer(attLocation, 3, gl.FLOAT, false, 0, 0);

    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(index), gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    render();

    function render(): void {
        if (!run) return;
        elapsed = (Date.now() - startTime) * 0.001;

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uniLocation.time, elapsed);
        gl.uniform2fv(uniLocation.mouse, [mx, my]);
        gl.uniform2fv(uniLocation.resolution, [c.width, c.height]);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.flush();

        setTimeout(render, 1000 / 30);
    }

    function createShader(src: string, type: number): WebGLShader {
        const shader = gl.createShader(type);
        if (!shader) throw new Error('createShader failed');
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(shader);
            alert(log);
            throw new Error(log ?? 'shader compile error');
        }
        return shader;
    }

    function createProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram {
        const program = gl.createProgram();
        if (!program) throw new Error('createProgram failed');
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const log = gl.getProgramInfoLog(program);
            alert(log);
            throw new Error(log ?? 'program link error');
        }
        gl.useProgram(program);
        return program;
    }
}
