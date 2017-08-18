# openlayers 扩展标绘V1.0

[![Build Status](https://www.travis-ci.org/sakitam-fdd/ol-plot.svg?branch=master)](https://www.travis-ci.org/sakitam-fdd/ol-plot)
[![NPM](https://nodei.co/npm/ol-plot.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/ol-plot/)

> 军事标绘功能，支持openlayers3，4。

> 基于ilocation的plot4ol3修改。 [原地址](http://git.oschina.net/ilocation/plot)

## build

> 重要: Github 仓库的 /dist 文件夹只有在新版本发布时才会更新。如果想要使用 Github 上最新的源码，你需要自己构建。

---

```bash
git clone https://github.com/sakitam-fdd/ol-plot.git
npm install
gulp compact-js
gulp compact-css
```

## Use

> `new olPlot.PlotDraw(map) 初始化标绘绘制工具`
> `new olPlot.PlotEdit(map) 初始化标绘编辑工具`

### CDN

```bash
https://unpkg.com/ol-plot@1.0.0/dist/ol-plot.min.js
https://unpkg.com/ol-plot@1.0.0/dist/ol-plot.js
https://unpkg.com/ol-plot@1.0.0/dist/ol-plot.css
https://unpkg.com/ol-plot@1.0.0/dist/ol-plot.min.css
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

##### plotDraw.on(olPlot.Event.EventType.DRAW_END, onDrawEnd, this)

> 监听符号结束绘制

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `type` | `olPlot.Event.EventType` | 事件类型，目前包括开始和结束事件 |
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
