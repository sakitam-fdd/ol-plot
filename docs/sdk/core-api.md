# 核心 API

## `new Plot(map, options?)`

```ts
interface PlotOptions {
  layerName?: string
  zIndex?: number
  isClear?: boolean
  zoomToExtent?: boolean
  pointTolerance?: number
}
```

实例包含三个职责清晰的模块：

| 模块 | 职责 | 常用方法 |
| --- | --- | --- |
| `plotDraw` | 创建标绘几何 | `activate`、`deactivate`、`isDrawing` |
| `plotEdit` | 移动要素与控制点 | `activate`、`deactivate` |
| `plotUtils` | 样式、序列化与恢复 | `getFeatures`、`addFeatures`、`removeAllFeatures` |

## 绘制

```ts
plot.plotDraw.activate(PlotTypes.DOUBLE_ARROW, {
  businessId: 'mission-42'
})

plot.plotDraw.on('drawStart', ({ feature, plotType }) => {})
plot.plotDraw.on('drawEnd', ({ feature, plotType }) => {})
```

固定控制点数量的符号会自动结束；曲线、多段线等符号通过双击结束。

## 编辑

```ts
map.on('singleclick', (event) => {
  const feature = map.forEachFeatureAtPixel(event.pixel, (item) => item)
  if (feature?.get('isPlot')) plot.plotEdit.activate(feature)
  else plot.plotEdit.deactivate()
})
```

编辑器只暂停当前生效的 `DragPan`，退出后恢复它原来的 active 状态，不改变 Interaction 集合顺序。

## 序列化

```ts
const snapshot = plot.plotUtils.getFeatures()
localStorage.setItem('plot-scene', JSON.stringify(snapshot))

plot.plotUtils.removeAllFeatures()
plot.plotUtils.addFeatures(JSON.parse(localStorage.getItem('plot-scene') || '[]'))
```

序列化结果包含几何、原始控制点和可恢复样式。业务属性可以在调用 `activate(type, params)` 时一并写入 Feature。

## 命名导出

```ts
import Plot, {
  Geometry,
  PlotDraw,
  PlotEdit,
  PlotOptions,
  PlotTypes,
  PlotUtils,
  StyleFactory
} from 'ol-plot'
```
