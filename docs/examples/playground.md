# 交互式 Playground

下面的 Demo 直接运行仓库内 SDK 源码和 OpenLayers 10.9。左侧工具栏覆盖全部标绘符号；选择工具并点击地图即可开始，完成后点击图形进入编辑。

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
- 曲线、折线、多边形和闭合曲面需要双击结束。
- 点击已完成图形后可整体拖动，拖动圆形控制点可修改几何。
- “复制 JSON”会输出可以传给 `plotUtils.addFeatures()` 的快照。
