# OpenLayers 兼容实现规范

SDK 的支持范围是 `ol >= 6.15.0 < 11`。公开兼容说明见 [`OpenLayers 多版本兼容`](/guide/compatibility)。

## 依赖与导入

- `ol` 必须同时保持为 `peerDependency` 和开发测试依赖。
- `packages/ol-plot/vite.config.ts` 必须 externalize `ol` 及所有 `ol/*` 子路径。
- SDK 源码可沿用兼容的模块入口；文档和应用示例优先使用带 `.js` 后缀的官方 ESM 路径。
- 不增加第二份 OpenLayers、私有深层路径或只存在于最新主版本的导出。

## Interaction 所有权

OL Plot 只能临时改变所需 Interaction，并准确恢复进入前状态：

1. 查找目标 Interaction，并记录 `getActive()`。
2. 绘制或编辑期间调用 `setActive(false)`。
3. 完成、取消、异常退出和销毁时恢复记录值。
4. 若完成发生在 `dblclick` 事件中，恢复操作必须延迟到当前浏览器事件栈结束，避免 `DoubleClickZoom` 接收同一次事件。
5. 激活新工具前取消待执行的恢复任务，防止旧任务重新启用 Interaction。

优先使用 OpenLayers 6.15 已存在的稳定方法：`getInteractions()`、`getActive()`、`setActive()`、`on()`、`un()`、`preventDefault()` 与 `stopPropagation()`。

## 兼容矩阵

CI 使用以下代表版本执行类型、构建与测试：

| 主版本 | 验证版本 |
| --- | --- |
| 6 | 6.15.1 |
| 7 | 7.5.2 |
| 8 | 8.2.0 |
| 9 | 9.2.4 |
| 10 | 10.9.0 |

涉及 Interaction、Overlay、样式、事件或模块入口的修改，必须在全部五个代表版本上验证。纯文档改动可只构建文档站。

## 兼容实现检查

- 是否复用公共 API 而非内部字段？
- 是否保存并恢复宿主地图原有状态？
- 同一个完成事件是否可能继续被后续 Interaction 消费？
- 类型声明是否能在兼容下限安装后通过？
- 构建产物是否仍把 `ol` 标为外部依赖？
