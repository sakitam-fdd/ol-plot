# Vue 3 示例

核心 SDK 与框架无关：在 `onMounted` 中创建 `Plot`，按需 `activate` 任意 `PlotTypes`。

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import Plot, { PlotTypes } from 'ol-plot'

const target = shallowRef<HTMLElement>()
let map: Map
let plot: Plot

const tools = [
  { type: PlotTypes.ATTACK_ARROW, label: '进攻箭头' },
  { type: PlotTypes.DOUBLE_ARROW, label: '双箭头' },
  { type: PlotTypes.LUNE, label: '弓形' },
  { type: PlotTypes.GATHERING_PLACE, label: '集结地' },
  { type: PlotTypes.RECTINCLINED1, label: '斜矩形1' },
  { type: PlotTypes.TAILED_SQUAD_COMBAT, label: '燕尾分队战斗' },
  { type: PlotTypes.CURVEFLAG, label: '曲线旗' },
  { type: PlotTypes.TEXTAREA, label: '文本框' },
] as const

onMounted(() => {
  map = new Map({ target: target.value, view: new View({ center: [0, 0], zoom: 4 }) })
  plot = new Plot(map)
  plot.plotDraw.on('drawEnd', (event) => {
    if (event.feature) plot.plotEdit.activate(event.feature)
  })
})

onBeforeUnmount(() => {
  plot?.destroy()
  map?.setTarget(undefined)
})

const draw = (type: PlotTypes) => plot.plotDraw.activate(type)
</script>

<template>
  <div class="toolbar">
    <button v-for="tool in tools" :key="tool.type" type="button" @click="draw(tool.type)">
      {{ tool.label }}
    </button>
  </div>
  <div ref="target" class="map" />
</template>
```

完整符号表见 [交互式 Playground](./playground.md)。若需要开箱即用的工具面板，可使用仓库中的 `ol-plot-vue`；对设计系统要求较高的项目，推荐直接组合核心 SDK。
