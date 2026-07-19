# 快速开始

OL Plot 为 OpenLayers 增加可交互的地图标绘能力。SDK 不创建底图，只接管自己的矢量图层、绘制事件和编辑控制点。

## 安装

```bash
pnpm add ol ol-plot
```

```ts
import 'ol/ol.css'
import 'ol-plot/style.css'

import Map from 'ol/Map.js'
import View from 'ol/View.js'
import TileLayer from 'ol/layer/Tile.js'
import OSM from 'ol/source/OSM.js'
import Plot, { PlotTypes } from 'ol-plot'

const map = new Map({
  target: 'map',
  layers: [new TileLayer({ source: new OSM() })],
  view: new View({ center: [0, 0], zoom: 3 })
})

const plot = new Plot(map, {
  layerName: 'business-plot-layer',
  zIndex: 20,
  pointTolerance: 5
})

plot.plotDraw.activate(PlotTypes.ATTACK_ARROW)
plot.plotDraw.on('drawEnd', (event) => {
  if (event.feature) plot.plotEdit.activate(event.feature)
})
```

## 生命周期

在单页应用卸载页面时销毁实例。`destroy()` 会结束绘制、退出编辑并释放 SDK 自身的监听器。

```ts
onBeforeUnmount(() => {
  plot.destroy()
  map.setTarget(undefined)
})
```

## 接下来

- 在[交互式 Playground](/examples/playground)体验符号和编辑行为。
- 阅读[核心 API](/sdk/core-api)了解绘制、编辑和序列化。
- 升级旧项目时先查看[兼容与迁移](/guide/compatibility)。
