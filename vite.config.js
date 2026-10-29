import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// 複数ページをビルド対象にする(dev サーバーは設定なしでも全ページ開ける)
export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: resolve(import.meta.dirname, 'index.html'),
                g001: resolve(import.meta.dirname, 'g001.html'),
                g002: resolve(import.meta.dirname, 'g002.html'),
            },
        },
    },
});
