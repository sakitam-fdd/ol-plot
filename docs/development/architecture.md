# SDK 架构与修改边界

本文是核心 SDK、图形算法与生命周期修改的开发参考。用户 API 请同时维护 [`核心 API`](/sdk/core-api) 文档。

## 运行时结构

`new Plot(map, options)` 会创建三个长期实例：

| 模块 | 职责 | 生命周期出口 |
| --- | --- | --- |
| `PlotDraw` | 创建图形、管理绘制事件与临时地图交互 | `deactivate()` |
| `PlotEdit` | 激活要素、控制点编辑与整体拖动 | `deactivate()` |
| `PlotUtils` | 样式、查询、序列化、恢复与清理 | `destroy()` |

应用卸载时必须调用 `plot.destroy()`。新增事件、Interaction、Overlay、计时器或 DOM 节点时，需要在取消激活及销毁路径中成对释放。

## 几何数据流

1. `PlotDraw.activate(type, params)` 选择符号并进入绘制状态。
2. `createPlot()` 根据 `PlotTypes` 创建几何实例。
3. 几何类保存原始控制点，并在 `generate()` 中计算 OpenLayers 坐标。
4. `drawEnd` 交付 `Feature`，随后清理绘制状态。
5. `PlotEdit.activate(feature)` 使用原始控制点建立编辑 Overlay。
6. `PlotUtils.getFeatures()` 保存最终坐标、控制点、符号类型与样式；`addFeatures()` 负责恢复。

图形算法修改必须保持以下不变量：

- 输入点不足时可安全返回，不产生 `NaN` 或无穷坐标。
- `setPoints(getPoints())` 应生成等价几何。
- 顺时针与逆时针输入不应导致箭头主体翻转或自交。
- 采样密度不得随地图缩放级别意外爆炸。
- 像素容差需通过地图像素换算，不把投影单位硬编码成屏幕距离。

## 公共 API 规则

- 公共选项和事件类型定义在 `packages/ol-plot/src/types.ts`，并从 `src/index.ts` 导出。
- 新 API 使用清晰的动词；保留 `active`、`disActive` 等旧别名作为兼容层。
- 样式使用 OpenLayers `StyleLike`，序列化结果必须可恢复。
- 错误输入可以明确抛错；正常取消、空选择等用户路径不应产生异常。

## 常见风险

- 同一事件栈内恢复 OpenLayers Interaction，可能让刚刚完成的双击继续触发地图默认行为。
- `instanceof Map/Feature` 依赖单一 OpenLayers 运行时，因此 SDK 构建必须 externalize `ol`。
- 只移除事件监听但不恢复原激活状态，会改变宿主地图行为。
- 仅更新几何坐标而不更新原始控制点，会破坏后续编辑和序列化。
