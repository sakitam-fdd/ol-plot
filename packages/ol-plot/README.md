# ol-plot

OpenLayers 地图标绘 SDK，支持 OpenLayers 6.15–10.x、27 种标绘符号、控制点编辑、样式序列化和场景恢复。

## 安装

```bash
pnpm add ol ol-plot
```

```ts
import 'ol/ol.css'
import 'ol-plot/style.css'

import Plot, { PlotTypes } from 'ol-plot'

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

## 数据恢复

```ts
const snapshot = plot.plotUtils.getFeatures()
plot.plotUtils.removeAllFeatures()
plot.plotUtils.addFeatures(snapshot)
```

## 生命周期

```ts
plot.destroy()
```

完整指南、API、兼容矩阵与在线 Playground：<https://sakitam-fdd.github.io/ol-plot/>

## License

MIT
