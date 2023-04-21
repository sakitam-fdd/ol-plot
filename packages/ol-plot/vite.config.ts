import { defineConfig } from 'vite';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
// import dts from 'rollup-plugin-dts';
import eslint from 'vite-plugin-eslint';
import { viteExternalsPlugin } from 'vite-plugin-externals';
const ROOT = fileURLToPath(import.meta.url);

const r = (p: string) => resolve(ROOT, '..', p);

const name = 'ol-plot';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    base: './',
    publicDir: 'assets',
    build: {
      outDir: 'dist',
      assetsDir: 'images',
      assetsInlineLimit: 0, // @link https://cn.vitejs.dev/config/#build-assetsinlinelimit
      watch: mode === 'watch' ? {} : null,
      minify: mode === 'minify' ? 'esbuild' : false,
      sourcemap: mode !== 'minify',
      brotliSize: true, // @link https://cn.vitejs.dev/config/#build-brotlisize
      // @link https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/css.ts#L483
      cssCodeSplit: false, // @link https://cn.vitejs.dev/config/#build-csscodesplit
      emptyOutDir: false,
      lib: {
        entry: r('src/index.js'),
        name: 'olPlot',
        formats: ['es', 'cjs', 'umd'],
        fileName: (format) => {
          if (mode === 'minify') {
            return format === 'umd' ? `${name}.min.js` : `${name}.${format}.min.js`;
          }
          return format === 'umd' ? `${name}.js` : `${name}.${format}.js`;
        },
      },
      rollupOptions: {
        output: {
          // assetFileNames: '[name].[ext]',
          assetFileNames: 'ol-plot.[ext]', // hack for css file
          globals: {
            ol: 'ol',
            'ol/style': 'ol.style',
            'ol/layer': 'ol.layer',
            'ol/source': 'ol.source',
            'ol/geom': 'ol.geom',
            'ol/geom/Polygon': 'ol.geom.Polygon',
            'ol/color': 'ol.color',
            'ol/extent': 'ol.extent',
            'ol/events/Event': 'ol.events.Event',
            'ol/interaction/Draw': 'ol.interaction.Draw',
            'ol/interaction/DragPan': 'ol.interaction.DragPan',
            'ol/interaction/DoubleClickZoom': 'ol.interaction.DoubleClickZoom',
          },
        },
        external: (id) => /^ol/.test(id),
      },
    },
    plugins: [
      // dts({ respectExternal: true }),
      viteExternalsPlugin(),
      ...(mode === 'watch' ? [eslint()] : []),
    ],
    css: {
      preprocessorOptions: {
        less: {
          globalVars: {},
          // 支持内联 JavaScript
          javascriptEnabled: true,
          // 重写 less 变量，定制样式
          // modifyVars: themeVariables,
          sourceMap: false,
        },
      },
      modules: {
        localsConvention: 'camelCase',
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    test: {
      testTimeout: 50000,
      // setupFiles: '../../vitest/setupTest.ts',
      coverage: {
        reporter: ['lcov', 'html'],
      },
      threads: false,
    },
  };
});
