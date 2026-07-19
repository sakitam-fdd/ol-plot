# 迁移指南

## 从旧版 OL Plot 升级

### OpenLayers 版本范围

OpenLayers 5 已移出支持范围。请将应用升级到 6.15 或更高版本，推荐直接使用当前 OpenLayers 10。

### 样式入口

推荐从稳定的导出路径加载样式：

```diff
- import 'ol-plot/dist/ol-plot.css'
+ import 'ol-plot/style.css'
```

原路径仍然保留，已有应用无需立即修改。

### 绘制容差

旧版使用固定地图坐标差值判断重复点，在 EPSG:3857 与 EPSG:4326 下表现不同。现在默认使用 `4px`：

```ts
const plot = new Plot(map, { pointTolerance: 6 })
```

### 页面卸载

```ts
plot.destroy()
```

该调用是幂等清理入口。Vue/React 等单页应用应在组件卸载时调用。
