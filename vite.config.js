import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// 複数ページをビルド対象にする(dev サーバーは設定なしでも全ページ開ける)
export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            input: {
                index: resolve(import.meta.dirname, 'index.html'),
                g001: resolve(import.meta.dirname, 'g001.html'),
                g002: resolve(import.meta.dirname, 'g002.html'),
                g003: resolve(import.meta.dirname, 'g003.html'),
                g004: resolve(import.meta.dirname, 'g004.html'),
                g005: resolve(import.meta.dirname, 'g005.html'),
                g006: resolve(import.meta.dirname, 'g006.html'),
                g007: resolve(import.meta.dirname, 'g007.html'),
                g008: resolve(import.meta.dirname, 'g008.html'),
                g009: resolve(import.meta.dirname, 'g009.html'),
                g010: resolve(import.meta.dirname, 'g010.html'),
                g011: resolve(import.meta.dirname, 'g011.html'),
                g012: resolve(import.meta.dirname, 'g012.html'),
                g013: resolve(import.meta.dirname, 'g013.html'),
                g014: resolve(import.meta.dirname, 'g014.html'),
                g015: resolve(import.meta.dirname, 'g015.html'),
                g016: resolve(import.meta.dirname, 'g016.html'),
                g017: resolve(import.meta.dirname, 'g017.html'),
                g018: resolve(import.meta.dirname, 'g018.html'),
                g019: resolve(import.meta.dirname, 'g019.html'),
                g020: resolve(import.meta.dirname, 'g020.html'),
            },
        },
    },
});
