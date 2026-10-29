import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist-offline/glsl-offline');
await mkdir(output, { recursive: true });

const index = await readFile(resolve(root, 'index.html'), 'utf8');
const downloadLink = '    <p><a href="glsl-offline.zip">オフライン版(zip)</a></p>\n';
if (!index.includes(downloadLink)) throw new Error('Offline download link not found in index.html');
await writeFile(resolve(output, 'index.html'), index.replace(downloadLink, ''));

for (let number = 1; number <= 20; number++) {
    const name = `g${String(number).padStart(3, '0')}`;
    const result = await build({
        configFile: false,
        root,
        logLevel: 'error',
        build: {
            write: false,
            minify: false,
            lib: {
                entry: resolve(root, `src/${name}.js`),
                formats: ['iife'],
                name: 'GlslSample',
            },
        },
    });
    const files = (Array.isArray(result) ? result : [result]).flatMap((bundle) => bundle.output);
    const chunks = files.filter((file) => file.type === 'chunk');
    if (files.length !== 1 || chunks.length !== 1) {
        throw new Error(`Expected one self-contained JS chunk for ${name}`);
    }

    const html = await readFile(resolve(root, `${name}.html`), 'utf8');
    const moduleTag = `<script type="module" src="/src/${name}.js"></script>`;
    if (!html.includes(moduleTag)) throw new Error(`Module script tag not found in ${name}.html`);
    // A literal closing script tag inside a shader string must not end the HTML script.
    const code = chunks[0].code.replace(/<\/script/gi, '<\\/script');
    await writeFile(resolve(output, `${name}.html`), html.replace(moduleTag, `<script>\n${code}</script>`));
}
