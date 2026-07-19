# Vue 3 示例

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import Map from 'ol/Map.js'
import View from 'ol/View.js'
import Plot, { PlotTypes } from 'ol-plot'

const target = shallowRef<HTMLElement>()
let map: Map
let plot: Plot

onMounted(() => {
  map = new Map({ target: target.value, view: new View({ center: [0, 0], zoom: 4 }) })
  plot = new Plot(map)
})

onBeforeUnmount(() => {
  plot?.destroy()
  map?.setTarget(undefined)
})

const draw = () => plot.plotDraw.activate(PlotTypes.DOUBLE_ARROW)
</script>

<template>
  <button type="button" @click="draw">绘制双箭头</button>
  <div ref="target" class="map" />
</template>
```

如果需要开箱即用的工具面板，可继续使用仓库中的 `ol-plot-vue`；对设计系统要求较高的项目，推荐直接组合核心 SDK。
