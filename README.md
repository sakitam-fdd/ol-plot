# openlayers 扩展标绘

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

## Examples
<!--[标绘demo](http://htmlpreview.github.io/?https://github.com/pingpingEE/ol-plot/blob/V1.0.0/examples/index.html)
![标绘图](https://github.com/pingpingEE/ol-plot/blob/V1.0.0/images/readme/plot.png)-->

其他示例请参看examples文件夹

#### plotDraw Methods

##### `active()`

> 激活标绘工具

##### `deactivate()`

> 结束标绘

##### `setMap(map)`

> 设置当前地图实例

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `map` | `ol.Map` | 地图实例 |


#### plotEdit Methods

##### `active()`

> 激活标绘编辑工具

##### `deactivate()`

> 结束编辑

##### `setMap(map)`

> 设置当前地图实例

###### Parameters:

| key | type | desc |
| :--- | :--- | :---------- |
| `map` | `ol.Map` | 地图实例 |
