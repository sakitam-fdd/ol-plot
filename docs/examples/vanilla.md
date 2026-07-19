# 原生 JavaScript 示例

```ts
import 'ol/ol.css'
import 'ol-plot/style.css'
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import Plot, { PlotTypes } from 'ol-plot'

const map = new Map({ target: 'map', view: new View({ center: [0, 0], zoom: 4 }) })
const plot = new Plot(map)

document.querySelector('[data-plot="arrow"]')?.addEventListener('click', () => {
  plot.plotDraw.activate(PlotTypes.ATTACK_ARROW)
})
```

生产项目应为地图容器设置明确高度，并在销毁页面时调用 `plot.destroy()`。
