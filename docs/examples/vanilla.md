# 原生 JavaScript 示例

通过 `plot.plotDraw.activate(PlotTypes.XXX)` 激活任意符号。下面示例列出全部 `PlotTypes`，便于对照 playground 与 SDK。

```ts
import 'ol/ol.css'
import 'ol-plot/style.css'
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import Plot, { PlotTypes } from 'ol-plot'

const map = new Map({ target: 'map', view: new View({ center: [0, 0], zoom: 4 }) })
const plot = new Plot(map)

/** 全部可激活的几何类型（TextArea 走 Overlay 文本框流程） */
const allPlotTypes = [
  PlotTypes.POINT,
  PlotTypes.PENNANT,
  PlotTypes.POLYLINE,
  PlotTypes.CURVE,
  PlotTypes.FREEHANDLINE,
  PlotTypes.ARC,
  PlotTypes.CIRCLE,
  PlotTypes.ELLIPSE,
  PlotTypes.RECTANGLE,
  PlotTypes.RECTINCLINED1,
  PlotTypes.RECTINCLINED2,
  PlotTypes.POLYGON,
  PlotTypes.FREE_POLYGON,
  PlotTypes.LUNE,
  PlotTypes.SECTOR,
  PlotTypes.CLOSED_CURVE,
  PlotTypes.GATHERING_PLACE,
  PlotTypes.STRAIGHT_ARROW,
  PlotTypes.FINE_ARROW,
  PlotTypes.ASSAULT_DIRECTION,
  PlotTypes.ATTACK_ARROW,
  PlotTypes.TAILED_ATTACK_ARROW,
  PlotTypes.SQUAD_COMBAT,
  PlotTypes.TAILED_SQUAD_COMBAT,
  PlotTypes.DOUBLE_ARROW,
  PlotTypes.RECTFLAG,
  PlotTypes.TRIANGLEFLAG,
  PlotTypes.CURVEFLAG,
  PlotTypes.TEXTAREA,
] as const

document.querySelectorAll<HTMLButtonElement>('[data-plot]').forEach((button) => {
  button.addEventListener('click', () => {
    const type = button.dataset.plot as (typeof allPlotTypes)[number]
    if (allPlotTypes.includes(type)) {
      plot.plotDraw.activate(type)
    }
  })
})

plot.plotDraw.on('drawEnd', (event) => {
  if (event.feature) plot.plotEdit.activate(event.feature)
})
```

对应工具栏可写成：

```html
<button data-plot="AttackArrow">进攻箭头</button>
<button data-plot="Lune">弓形</button>
<button data-plot="RectInclined1">斜矩形1</button>
<button data-plot="TailedSquadCombat">燕尾分队战斗</button>
<button data-plot="TextArea">文本框</button>
```

生产项目应为地图容器设置明确高度，并在销毁页面时调用 `plot.destroy()`。更完整的交互可直接参考仓库内 `playground/single`（覆盖全部 29 种符号）。
