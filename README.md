# openlayers 扩展标绘V2.0

[![Build Status](https://www.travis-ci.org/sakitam-fdd/ol-plot.svg?branch=master)](https://www.travis-ci.org/sakitam-fdd/ol-plot)
[![NPM](https://nodei.co/npm/ol-plot.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ol-plot/)

> 军事标绘功能，支持openlayers3，4。

## build

> 重要: Github 仓库的 /dist 文件夹只有在新版本发布时才会更新。如果想要使用 Github 上最新的源码，你需要自己构建。

---

```bash
git clone https://github.com/sakitam-fdd/ol-plot.git
npm run dev
npm run build
```

## Use

> `new olPlot.(map) 初始化标绘绘制工具`

### CDN

```bash
https://unpkg.com/ol-plot@2.0.0/dist/ol-plot.min.js
https://unpkg.com/ol-plot@2.0.0/dist/ol-plot.js
https://unpkg.com/ol-plot@2.0.0/dist/ol-plot.css
https://unpkg.com/ol-plot@2.0.0/dist/ol-plot.min.css
```

### NPM

```bash
npm install ol-plot --save
import olPlot 'ol-plot'
```

## Examples

[![demo](https://raw.githubusercontent.com/sakitam-fdd/ol-plot/V1.0.0/examples/images/demo.png)](https://codepen.io/sakitam-fdd/pen/QMQydz)

其他示例请参看examples文件夹

#### plotDraw Methods

##### `activate(type)`

> 激活标绘工具

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `type` | `string` | 标绘符号类型 |

##### `type`

> 标绘类型

###### type:

| key | type | desc |
| :---------------------- | :--- | :---------- |
| `olPlot.PlotTypes.ARC` | `string` | 弓形 |
| `olPlot.PlotTypes.ELLIPSE` | `string` | 椭圆 |
| `olPlot.PlotTypes.CURVE` | `string` | 曲线 |
| `olPlot.PlotTypes.CLOSED_CURVE` | `string` | 闭合曲面 |
| `olPlot.PlotTypes.LUNE` | `string` | 弓形 |
| `olPlot.PlotTypes.SECTOR` | `string` | 扇形 |
| `olPlot.PlotTypes.GATHERING_PLACE` | `string` | 集结地 |
| `olPlot.PlotTypes.STRAIGHT_ARROW` | `string` | 细直箭头 |
| `olPlot.PlotTypes.ASSAULT_DIRECTION` | `string` | 粗单直箭头 |
| `olPlot.PlotTypes.ATTACK_ARROW` | `string` | 进攻方向 |
| `olPlot.PlotTypes.TAILED_ATTACK_ARROW` | `string` | 进攻方向（尾） |
| `olPlot.PlotTypes.SQUAD_COMBAT` | `string` | 战斗行动 |
| `olPlot.PlotTypes.TAILED_SQUAD_COMBAT` | `string` | 分队战斗行动（尾） |
| `olPlot.PlotTypes.FINE_ARROW` | `string` | 粗单尖头箭头 |
| `olPlot.PlotTypes.CIRCLE` | `string` | 圆 |
| `olPlot.PlotTypes.DOUBLE_ARROW` | `string` | 双箭头 |
| `olPlot.PlotTypes.POLYLINE` | `string` | 线 |
| `olPlot.PlotTypes.FREEHAND_LINE` | `string` | 自由线 |
| `olPlot.PlotTypes.POLYGON` | `string` | 面 |
| `olPlot.PlotTypes.FREEHAND_POLYGON` | `string` | 自由面 |
| `olPlot.PlotTypes.RECTANGLE` | `string` | 矩形 |
| `olPlot.PlotTypes.MARKER` | `string` | 点 |

##### plotDraw.on('drawEnd', onDrawEnd, this)

> 监听符号结束绘制

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `type` | `String` | 事件类型，目前包括开始和结束事件 |
| `onDrawEnd` | `Function` | 事件的回调函数 |
| `this` | `Object` | 上下文，可不传 |

##### `setMap(map)`

> 设置当前地图实例

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `map` | `ol.Map` | 地图实例 |


#### plotEdit Methods

##### `activate(feature)`

> 激活标绘编辑工具

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `feature` | `ol.Feature` | 要激活的标绘符号 |

##### `deactivate()`

> 取消符号的编辑状态

##### `setMap(map)`

> 设置当前地图实例

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `map` | `ol.Map` | 地图实例 |
