<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
  import Map from 'ol/Map';
  import View from 'ol/View';
  import TileLayer from 'ol/layer/Tile';
  import OSM from 'ol/source/OSM';
  import { fromLonLat } from 'ol/proj';
  import Plot, { PlotTypes, type PlotSerializedFeature } from 'ol-plot';

  const target = ref<HTMLElement>();
  const map = shallowRef<Map>();
  const plot = shallowRef<Plot>();
  const activeType = ref<PlotTypes | null>(null);
  const featureCount = ref(0);
  const notice = ref('选择一种符号，然后在地图上点击控制点');

  const groups = [
    {
      label: '常用',
      items: [
        [PlotTypes.STRAIGHT_ARROW, '直箭头'],
        [PlotTypes.FINE_ARROW, '细箭头'],
        [PlotTypes.DOUBLE_ARROW, '双箭头'],
        [PlotTypes.ATTACK_ARROW, '进攻箭头'],
      ],
    },
    {
      label: '线面',
      items: [
        [PlotTypes.CURVE, '曲线'],
        [PlotTypes.CLOSED_CURVE, '闭合曲面'],
        [PlotTypes.CIRCLE, '圆'],
        [PlotTypes.SECTOR, '扇形'],
        [PlotTypes.RECTANGLE, '矩形'],
      ],
    },
  ] as const;

  const activeLabel = computed(() => {
    for (const group of groups) {
      const item = group.items.find(([type]) => type === activeType.value);
      if (item) return item[1];
    }
    return '未选择';
  });

  function updateCount() {
    featureCount.value = plot.value?.plotUtils.getFeatures().length ?? 0;
  }

  function activate(type: PlotTypes) {
    if (!plot.value) return;
    plot.value.plotEdit.deactivate();
    plot.value.plotDraw.activate(type);
    activeType.value = type;
    notice.value =
      type === PlotTypes.CURVE || type === PlotTypes.CLOSED_CURVE
        ? '单击添加控制点，双击结束'
        : '在地图上依次点击控制点';
  }

  function clearAll() {
    if (!plot.value) return;
    plot.value.plotDraw.deactivate();
    plot.value.plotEdit.deactivate();
    plot.value.plotUtils.removeAllFeatures();
    activeType.value = null;
    notice.value = '画布已清空，可以开始新的标绘';
    updateCount();
  }

  async function copyJSON() {
    const features = plot.value?.plotUtils.getFeatures() ?? [];
    try {
      await navigator.clipboard.writeText(JSON.stringify(features, null, 2));
      notice.value = `已复制 ${features.length} 个标绘要素的 JSON`;
    } catch {
      notice.value = '浏览器未开放剪贴板权限';
    }
  }

  function seedDemo() {
    if (!plot.value) return;
    const points = [
      [116.12, 39.72],
      [116.62, 40.02],
      [117.02, 39.66],
    ].map((coordinate) => fromLonLat(coordinate) as [number, number]);
    const features: PlotSerializedFeature[] = [
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] },
        properties: {
          type: PlotTypes.ATTACK_ARROW,
          points,
          style: {
            fill: { fillColor: 'rgba(99, 91, 255, .28)' },
            stroke: { strokeColor: '#635bff', strokeWidth: 3 },
          },
        },
      },
    ];
    plot.value.plotUtils.addFeatures(features);
    updateCount();
  }

  onMounted(() => {
    if (!target.value) return;
    const mapInstance = new Map({
      target: target.value,
      layers: [
        new TileLayer({
          source: new OSM({ crossOrigin: 'anonymous' }),
        }),
      ],
      view: new View({ center: fromLonLat([116.55, 39.86]), zoom: 8 }),
    });
    const plotInstance = new Plot(mapInstance, { pointTolerance: 5, zIndex: 20 });
    map.value = mapInstance;
    plot.value = plotInstance;

    plotInstance.plotDraw.on('drawEnd', (event) => {
      activeType.value = null;
      notice.value = '绘制完成。点击图形可拖动或调整控制点';
      if (event.feature) plotInstance.plotEdit.activate(event.feature);
      updateCount();
    });

    mapInstance.on('singleclick', (event) => {
      if (plotInstance.plotDraw.isDrawing()) return;
      const feature = mapInstance.forEachFeatureAtPixel(event.pixel, (candidate) => candidate);
      if (feature?.get('isPlot')) plotInstance.plotEdit.activate(feature);
      else plotInstance.plotEdit.deactivate();
    });

    seedDemo();
  });

  onBeforeUnmount(() => {
    plot.value?.destroy();
    map.value?.setTarget(undefined);
  });
</script>

<template>
  <div class="playground-shell">
    <aside class="tool-panel" aria-label="标绘工具">
      <div class="tool-heading">
        <span class="live-dot" aria-hidden="true"></span>
        Live playground
      </div>
      <div v-for="group in groups" :key="group.label" class="tool-group">
        <p>{{ group.label }}</p>
        <button
          v-for="([type, label], index) in group.items"
          :key="type"
          type="button"
          :class="{ active: activeType === type }"
          :aria-pressed="activeType === type"
          @click="activate(type)"
        >
          <span class="tool-glyph">{{ String(index + 1).padStart(2, '0') }}</span>
          {{ label }}
        </button>
      </div>
      <div class="panel-actions">
        <button type="button" @click="copyJSON">复制 JSON</button>
        <button type="button" class="danger" @click="clearAll">清空</button>
      </div>
    </aside>

    <section class="map-stage">
      <div ref="target" class="map-target" aria-label="可交互标绘地图"></div>
      <div class="map-status">
        <div>
          <span>当前工具</span>
          <strong>{{ activeLabel }}</strong>
        </div>
        <div>
          <span>要素</span>
          <strong>{{ featureCount }}</strong>
        </div>
      </div>
      <p class="map-notice">{{ notice }}</p>
    </section>
  </div>
</template>

<style scoped>
  .playground-shell {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    min-height: 560px;
    overflow: hidden;
    border: 1px solid var(--vp-c-divider);
    border-radius: 24px;
    background: var(--vp-c-bg);
    box-shadow: 0 24px 70px rgba(25, 25, 70, 0.12);
  }

  .tool-panel {
    position: relative;
    z-index: 2;
    padding: 20px 14px;
    border-right: 1px solid var(--vp-c-divider);
    background: color-mix(in srgb, var(--vp-c-bg) 92%, #635bff 8%);
  }

  .tool-heading {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 2px 8px 22px;
    font-size: 12px;
    font-weight: 750;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #31c48d;
    box-shadow: 0 0 0 5px rgba(49, 196, 141, 0.12);
  }

  .tool-group {
    margin-top: 18px;
  }
  .tool-group p {
    margin: 0 8px 8px;
    color: var(--vp-c-text-3);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
  }

  .tool-group button,
  .panel-actions button {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 39px;
    margin: 3px 0;
    padding: 0 10px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--vp-c-text-2);
    font-size: 13px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, transform 0.2s;
  }

  .tool-group button:hover {
    background: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    transform: translateX(2px);
  }
  .tool-group button.active {
    background: #635bff;
    color: #fff;
    box-shadow: 0 8px 20px rgba(99, 91, 255, 0.26);
  }
  .tool-glyph {
    width: 30px;
    color: currentColor;
    font-family: ui-monospace, monospace;
    font-size: 10px;
    opacity: 0.62;
  }

  .panel-actions {
    position: absolute;
    right: 14px;
    bottom: 16px;
    left: 14px;
    display: flex;
    gap: 6px;
  }
  .panel-actions button {
    justify-content: center;
    background: var(--vp-c-bg);
    text-align: center;
  }
  .panel-actions button.danger {
    color: var(--vp-c-danger-1);
  }

  .map-stage {
    position: relative;
    min-width: 0;
    background: #dde5e8;
  }
  .map-target {
    position: absolute;
    inset: 0;
  }
  .map-status {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    gap: 4px;
    padding: 5px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 14px;
    background: rgba(20, 22, 35, 0.82);
    color: #fff;
    box-shadow: 0 10px 28px rgba(15, 20, 30, 0.18);
    backdrop-filter: blur(12px);
  }
  .map-status div {
    min-width: 88px;
    padding: 8px 12px;
  }
  .map-status span {
    display: block;
    color: rgba(255, 255, 255, 0.58);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .map-status strong {
    display: block;
    margin-top: 2px;
    font-size: 14px;
  }
  .map-notice {
    position: absolute;
    right: 18px;
    bottom: 18px;
    left: 18px;
    width: fit-content;
    max-width: calc(100% - 36px);
    margin: 0;
    padding: 9px 13px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.9);
    color: #2a2d3c;
    font-size: 12px;
    box-shadow: 0 8px 24px rgba(15, 20, 30, 0.12);
    backdrop-filter: blur(10px);
  }

  :deep(.ol-attribution) {
    font-size: 10px;
  }
  :deep(.ol-zoom) {
    top: 16px;
    left: 16px;
    padding: 3px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.9);
  }
  :deep(.ol-zoom button) {
    margin: 2px;
    border-radius: 8px;
    background: #fff;
    color: #24263a;
  }

  @media (max-width: 760px) {
    .playground-shell {
      grid-template-columns: 1fr;
      min-height: 680px;
    }
    .tool-panel {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding: 12px;
      border-right: 0;
      border-bottom: 1px solid var(--vp-c-divider);
    }
    .tool-heading,
    .tool-group p,
    .panel-actions {
      display: none;
    }
    .tool-group {
      display: contents;
    }
    .tool-group button {
      flex: 0 0 auto;
      width: auto;
      margin: 0;
      padding: 0 12px;
    }
    .tool-glyph {
      width: 24px;
    }
    .map-status {
      top: 12px;
      right: 12px;
    }
    .map-status div {
      min-width: 66px;
      padding: 6px 8px;
    }
  }
</style>
