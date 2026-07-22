import { defineConfig } from 'vitepress';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  lang: 'zh-CN',
  title: 'OL Plot',
  description: '面向 OpenLayers 6–10 的高性能地图标绘 SDK',
  base: '/ol-plot/',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: 'https://sakitam-fdd.github.io' },
  head: [
    ['meta', { name: 'theme-color', content: '#635bff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'OL Plot — OpenLayers 标绘 SDK' }],
    ['meta', { property: 'og:description', content: '29 种标绘符号、可视化编辑与 OpenLayers 6–10 兼容。' }],
  ],
  themeConfig: {
    siteTitle: 'OL Plot',
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'SDK', link: '/sdk/core-api' },
      { text: '在线示例', link: '/examples/playground' },
      { text: '开发', link: '/development/architecture' },
      {
        text: 'v4.1',
        items: [
          { text: '版本兼容', link: '/guide/compatibility' },
          { text: '迁移指南', link: '/guide/migration' },
          { text: '更新日志', link: 'https://github.com/sakitam-fdd/ol-plot/blob/master/CHANGELOG.md' },
        ],
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: 'OpenLayers 兼容', link: '/guide/compatibility' },
            { text: '迁移指南', link: '/guide/migration' },
          ],
        },
      ],
      '/sdk/': [
        {
          text: 'SDK 参考',
          items: [
            { text: '核心 API', link: '/sdk/core-api' },
            { text: '算法与性能', link: '/sdk/algorithms' },
          ],
        },
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '交互式 Playground', link: '/examples/playground' },
            { text: '原生 JavaScript', link: '/examples/vanilla' },
            { text: 'Vue 3', link: '/examples/vue' },
          ],
        },
      ],
      '/development/': [
        {
          text: '项目开发',
          items: [
            { text: 'SDK 架构', link: '/development/architecture' },
            { text: 'OpenLayers 兼容实现', link: '/development/openlayers-compatibility' },
            { text: 'Demo 规范', link: '/development/demos' },
            { text: '验证清单', link: '/development/verification' },
          ],
        },
      ],
    },
    outline: { level: [2, 3], label: '本页内容' },
    search: { provider: 'local' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/sakitam-fdd/ol-plot' }],
    editLink: {
      pattern: 'https://github.com/sakitam-fdd/ol-plot/edit/master/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
    lastUpdated: { text: '最后更新' },
    docFooter: { prev: '上一页', next: '下一页' },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2017–present sakitam-fdd',
    },
  },
  vite: {
    resolve: {
      alias: [
        {
          find: /^ol-plot$/,
          replacement: fileURLToPath(new URL('../../packages/ol-plot/src/index.ts', import.meta.url)),
        },
        {
          find: '@',
          replacement: fileURLToPath(new URL('../../packages/ol-plot/src', import.meta.url)),
        },
      ],
    },
  },
});
