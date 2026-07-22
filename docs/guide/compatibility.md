# OpenLayers 多版本兼容

当前 SDK 的兼容目标是 `ol >= 6.15.0 < 11`。OpenLayers 由业务应用提供，OL Plot 不会把另一份 OpenLayers 打进产物，因此不会产生两个 `Map` / `Feature` 实例体系。

## 支持矩阵

| OpenLayers | 状态 | 说明 |
| --- | --- | --- |
| 10.x | 完整验证 | 当前开发与文档 Demo 基线 |
| 9.x | 自动验证 | 构建、类型与核心算法测试 |
| 8.x | 自动验证 | 构建、类型与核心算法测试 |
| 7.x | 自动验证 | 构建、类型与核心算法测试 |
| 6.15+ | 兼容下限 | 仅支持 6.15 及以上版本 |
| 5.x | 不再支持 | 已停止维护，建议先升级 OpenLayers |

## 为什么从 6.15 起步

OpenLayers 6.15 是 6.x 的稳定终点，具备此 SDK 依赖的 Interaction、Overlay、Style 和 ESM 能力。收紧下限可以删除不可验证的历史兼容声明，同时保留五个主版本的实际覆盖。

## 推荐导入方式

应用代码建议使用 OpenLayers 官方文档中的单模块路径并带 `.js` 后缀：

```ts
import Map from 'ol/Map.js'
import Feature from 'ol/Feature.js'
import VectorLayer from 'ol/layer/Vector.js'
```

OL Plot 的公开 API 不要求你的项目使用某一种打包器；Vite、Rollup、Webpack 5 和支持 ESM 的现代运行时都可以消费 ESM 构建。

## 地图交互状态

绘制期间 SDK 会暂时停用宿主地图的 `DoubleClickZoom`，并记录其原始激活状态。折线、多边形、曲线或箭头双击结束时，完成事件会被消费，缩放交互在当前事件栈结束后恢复，因此不会因结束绘制而意外放大地图。主动取消绘制时则立即恢复；如果宿主原本禁用了双击缩放，SDK 不会擅自启用。
