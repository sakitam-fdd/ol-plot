# OL Plot

[![CI](https://github.com/sakitam-fdd/ol-plot/actions/workflows/ci.yml/badge.svg)](https://github.com/sakitam-fdd/ol-plot/actions/workflows/ci.yml)
[![npm version](https://badgen.net/npm/v/ol-plot)](https://npm.im/ol-plot)
[![npm downloads](https://badgen.net/npm/dm/ol-plot)](https://npm.im/ol-plot)
[![license](https://img.shields.io/badge/license-MIT-635bff.svg)](./LICENSE)

面向 OpenLayers 的 TypeScript 地图标绘 SDK。包含 27 种点、线、面、箭头和旗标，支持控制点编辑、样式序列化与场景恢复。

- OpenLayers `6.15–10.x`
- 原生 JavaScript / TypeScript 与 Vue 2 / Vue 3
- ESM、CommonJS 与 UMD 构建
- 可恢复 JSON 与完整 TypeScript 类型

## 在线文档

- [快速开始](https://sakitam-fdd.github.io/ol-plot/guide/getting-started)
- [交互式 Playground](https://sakitam-fdd.github.io/ol-plot/examples/playground)
- [OpenLayers 兼容矩阵](https://sakitam-fdd.github.io/ol-plot/guide/compatibility)
- [核心 API](https://sakitam-fdd.github.io/ol-plot/sdk/core-api)

## 安装

```bash
pnpm add ol ol-plot
```

```ts
import 'ol/ol.css'
import 'ol-plot/style.css'

import Map from 'ol/Map.js'
import View from 'ol/View.js'
import Plot, { PlotTypes } from 'ol-plot'

const map = new Map({
  target: 'map',
  view: new View({ center: [0, 0], zoom: 4 })
})

const plot = new Plot(map, {
  layerName: 'plot-layer',
  pointTolerance: 5,
  zIndex: 20
})

plot.plotDraw.activate(PlotTypes.ATTACK_ARROW)
plot.plotDraw.on('drawEnd', (event) => {
  if (event.feature) plot.plotEdit.activate(event.feature)
})
```

单页应用卸载时释放实例：

```ts
plot.destroy()
map.setTarget(undefined)
```

## 序列化

```ts
const snapshot = plot.plotUtils.getFeatures()
plot.plotUtils.removeAllFeatures()
plot.plotUtils.addFeatures(snapshot)
```

快照包含几何、原始控制点和样式，可存储到数据库或浏览器本地存储。

## 本地开发

需要 Node.js 22+ 与 pnpm 10：

```bash
pnpm install
pnpm --filter ol-plot test:compat
pnpm docs
```

工作区还包含：

- `packages/ol-plot`：核心 SDK
- `packages/ol-plot-vue`：Vue 2/3 工具面板
- `docs`：VitePress 2 文档与内嵌 Demo
- `playground/single`：现代化原生 JavaScript 示例
- `playground/vue2`、`playground/vue3`：框架集成示例

## License

[MIT](./LICENSE)
