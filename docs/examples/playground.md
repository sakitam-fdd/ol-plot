# 交互式 Playground

下面的 Demo 直接运行仓库内 SDK 源码和 OpenLayers 10.9。左侧工具栏覆盖全部标绘符号；选择工具并点击地图即可开始，完成后点击图形进入编辑。切换到“样式”面板可按点、线、面修改颜色、透明度、边框和大小。

<ClientOnly>
  <PlotPlayground />
</ClientOnly>

## 符号一览

| 分组 | 类型 | 操作 |
| --- | --- | --- |
| 点线 | `Point` / `Pennant` | 单击落点 |
| 点线 | `Polyline` / `Curve` | 单击加点，双击结束 |
| 点线 | `FreeHandLine` | 移动采样，单击结束 |
| 点线 | `Arc` | 3 点定弧 |
| 面域 | `Circle` / `Ellipse` / `RectAngle` | 2 点 |
| 面域 | `RectInclined1` / `RectInclined2` | 3 点斜矩形 |
| 面域 | `Polygon` / `ClosedCurve` | 单击加点，双击结束 |
| 面域 | `FreePolygon` | 自由面 |
| 面域 | `Lune` / `Sector` / `GatheringPlace` | 3 点 |
| 箭头 | `StraightArrow` / `FineArrow` / `AssaultDirection` | 2 点 |
| 箭头 | `AttackArrow` / `TailedAttackArrow` | 箭尾宽 + 中轴，双击结束 |
| 箭头 | `SquadCombat` / `TailedSquadCombat` | 沿中轴加点，双击结束 |
| 箭头 | `DoubleArrow` | 最多 4 点 |
| 旗标 / 文本 | `RectFlag` / `TriangleFlag` / `CurveFlag` | 2 点 |
| 旗标 / 文本 | `TextArea` | 拖拽框选 Overlay 文本框 |

## 操作提示

- 固定点数符号会自动完成。
- 曲线、折线、多边形和闭合曲面需要双击结束；结束双击由 SDK 消费，不会触发地图缩放。
- 点击已完成图形后可整体拖动，拖动圆形控制点可修改几何。
- 在“样式”面板可显式激活或取消激活当前图形，取消后选择和样式设置仍会保留。
- 打开或切换样式面板不会改变地图中心和缩放级别；只有点击“缩放到”才会定位当前图形。
- “保存场景”将当前快照写入浏览器本地存储；清空后点击“恢复场景”会同时恢复几何、控制点和样式。
- “复制 JSON”会输出可以传给 `plotUtils.addFeatures()` 的快照。

## 完整生命周期

```ts
let selectedFeature

plot.plotDraw.on('drawEnd', ({ feature }) => {
  selectedFeature = feature
  if (feature) plot.plotEdit.activate(feature)
})

// 显式激活 / 取消激活
plot.plotEdit.activate(selectedFeature)
plot.plotEdit.deactivate()

// 保存 / 恢复场景，样式会包含在 snapshot 中
const snapshot = plot.plotUtils.getFeatures()
localStorage.setItem('plot-scene', JSON.stringify(snapshot))

plot.plotUtils.removeAllFeatures()
plot.plotUtils.addFeatures(JSON.parse(localStorage.getItem('plot-scene') || '[]'))
```
