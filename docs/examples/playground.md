# 交互式 Playground

下面的 Demo 直接运行仓库内 SDK 源码和 OpenLayers 10.9。选择工具并点击地图即可开始；完成后点击图形进入编辑。

<ClientOnly>
  <PlotPlayground />
</ClientOnly>

## 操作提示

- 固定点数符号会自动完成。
- 曲线和闭合曲面需要双击结束。
- 点击已完成图形后可整体拖动，拖动圆形控制点可修改几何。
- “复制 JSON”会输出可以传给 `plotUtils.addFeatures()` 的快照。
