import { resolve } from 'path';

import { defineConfig } from 'vite';
import type { UserConfigExport } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';

const name = 'ol-plot-vue';
export default defineConfig((env) => {
  const defaultConfig: UserConfigExport = {
    plugins: [
      vue(),
      dts({
        // outputDir: 'types',
        rollupTypes: true,
        staticImport: true,
        insertTypesEntry: true,
        cleanVueFileName: true,
      }),
    ],
    build: {
      cssCodeSplit: false,
      minify: env.mode === 'minify' ? 'esbuild' : false,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'VOlPlot',
        formats: ['es', 'cjs', 'umd'],
        fileName: (format) => {
          if (env.mode === 'minify') {
            return format === 'umd' ? `${name}.min.js` : `${name}.${format}.min.js`;
          }
          return format === 'umd' ? `${name}.js` : `${name}.${format}.js`;
        },
      },
      rollupOptions: {
        external: (id) => /^ol/.test(id) || id === 'vue' || id === 'vue-demi',
        output: {
          globals: {
            vue: 'Vue',
            'vue-demi': 'VueDemi',
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
      },
    },
    optimizeDeps: {
      exclude: ['vue-demi'],
    },
    test: {
      environment: 'happy-dom',
    },
  };
  return defaultConfig;
});
