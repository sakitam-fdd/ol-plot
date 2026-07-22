<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef } from 'vue';
  import Feature from 'ol/Feature';
  import Map from 'ol/Map';
  import View from 'ol/View';
  import TileLayer from 'ol/layer/Tile';
  import OSM from 'ol/source/OSM';
  import { fromLonLat } from 'ol/proj';
  import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
  import { asArray } from 'ol/color';
  import Plot, { PlotTypes, type PlotSerializedFeature } from 'ol-plot';

  type ToolItem = readonly [PlotTypes, string, string?];
  type GeometryKind = 'point' | 'line' | 'area';

  interface DemoStyle {
    fillColor: string;
    fillOpacity: number;
    strokeColor: string;
    strokeWidth: number;
    pointSize: number;
  }

  const target = ref<HTMLElement>();
  const map = shallowRef<Map>();
  const plot = shallowRef<Plot>();
  const activeType = ref<PlotTypes | null>(null);
  const panelMode = ref<'tools' | 'style'>('tools');
  const selectedFeature = shallowRef<Feature | null>(null);
  const isEditing = ref(false);
  const hasSavedScene = ref(false);
  const featureCount = ref(0);
  const notice = ref('选择一种符号，然后在地图上点击控制点');
  const styleState = reactive<DemoStyle>({
    fillColor: '#635bff',
    fillOpacity: 0.28,
    strokeColor: '#4338ca',
    strokeWidth: 2,
    pointSize: 8,
  });
  const storageKey = 'ol-plot:docs-playground:scene';
  let savedScene: PlotSerializedFeature[] = [];

  const groups: { label: string; items: ToolItem[] }[] = [
    {
      label: '点线',
      items: [
        [PlotTypes.POINT, '点', '单击落点即可完成'],
        [PlotTypes.PENNANT, '旗标点', '单击落点即可完成'],
        [PlotTypes.POLYLINE, '折线', '单击添加顶点，双击结束'],
        [PlotTypes.CURVE, '曲线', '单击添加控制点，双击结束'],
        [PlotTypes.FREEHANDLINE, '自由线', '按住移动绘制，单击结束'],
        [PlotTypes.ARC, '圆弧', '依次点击 3 个控制点'],
      ],
    },
    {
      label: '面域',
      items: [
        [PlotTypes.CIRCLE, '圆', '圆心 + 半径点'],
        [PlotTypes.ELLIPSE, '椭圆', '对角两点确定轴对齐椭圆'],
        [PlotTypes.RECTANGLE, '矩形', '对角两点'],
        [PlotTypes.RECTINCLINED1, '斜矩形1', '底边两点 + 高度点'],
        [PlotTypes.RECTINCLINED2, '斜矩形2', '底边两点 + 对角点'],
        [PlotTypes.POLYGON, '多边形', '单击添加顶点，双击结束'],
        [PlotTypes.FREE_POLYGON, '自由面', '按住移动绘制，单击结束'],
        [PlotTypes.LUNE, '弓形', '弦端点 + 弧上一点'],
        [PlotTypes.SECTOR, '扇形', '圆心 + 起止半径点'],
        [PlotTypes.CLOSED_CURVE, '闭合曲面', '单击添加控制点，双击结束'],
        [PlotTypes.GATHERING_PLACE, '集结地', '依次点击 3 个控制点'],
      ],
    },
    {
      label: '箭头',
      items: [
        [PlotTypes.STRAIGHT_ARROW, '直箭头', '起点 + 终点'],
        [PlotTypes.FINE_ARROW, '细箭头', '起点 + 终点'],
        [PlotTypes.ASSAULT_DIRECTION, '突击方向', '起点 + 终点'],
        [PlotTypes.ATTACK_ARROW, '进攻箭头', '箭尾宽两点 + 中轴点，双击结束'],
        [PlotTypes.TAILED_ATTACK_ARROW, '燕尾进攻箭头', '箭尾宽两点 + 中轴点，双击结束'],
        [PlotTypes.SQUAD_COMBAT, '分队战斗', '沿中轴依次点击，双击结束'],
        [PlotTypes.TAILED_SQUAD_COMBAT, '燕尾分队战斗', '沿中轴依次点击，双击结束'],
        [PlotTypes.DOUBLE_ARROW, '双箭头', '依次点击最多 4 个控制点'],
      ],
    },
    {
      label: '旗标 / 文本',
      items: [
        [PlotTypes.RECTFLAG, '矩形旗', '旗杆顶 + 旗面对角'],
        [PlotTypes.TRIANGLEFLAG, '三角旗', '旗杆顶 + 旗面对角'],
        [PlotTypes.CURVEFLAG, '曲线旗', '旗杆顶 + 旗面对角'],
        [PlotTypes.TEXTAREA, '文本框', '拖拽框选文本区域'],
      ],
    },
  ];

  const tipByType = computed(() => {
    const mapTips = new Map<PlotTypes, string>();
    for (const group of groups) {
      for (const [type, , tip] of group.items) {
        if (tip) mapTips.set(type, tip);
      }
    }
    return mapTips;
  });

  const activeLabel = computed(() => {
    for (const group of groups) {
      const item = group.items.find(([type]) => type === activeType.value);
      if (item) return item[1];
    }
    return '未选择';
  });

  const selectedKind = computed<GeometryKind | null>(() => {
    const type = selectedFeature.value?.getGeometry()?.getType();
    if (type === 'Point') return 'point';
    if (type === 'LineString') return 'line';
    if (type === 'Polygon') return 'area';
    return null;
  });

  const selectedKindLabel = computed(() => {
    if (selectedKind.value === 'point') return '点样式';
    if (selectedKind.value === 'line') return '线样式';
    if (selectedKind.value === 'area') return '面样式';
    return '未选择图形';
  });

  function colorToHex(color: unknown, fallback: string) {
    if (!color) return fallback;
    try {
      const [red, green, blue] = asArray(color as string);
      return `#${[red, green, blue]
        .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
        .join('')}`;
    } catch {
      return fallback;
    }
  }

  function colorOpacity(color: unknown, fallback: number) {
    if (!color) return fallback;
    try {
      return Number(asArray(color as string)[3] ?? fallback);
    } catch {
      return fallback;
    }
  }

  function resolveStyle(feature: Feature) {
    const featureStyle = feature.getStyle();
    if (featureStyle instanceof Style) return featureStyle;
    const baseStyle = plot.value?.plotUtils.getBaseStyle(feature);
    return baseStyle instanceof Style ? baseStyle : null;
  }

  function readStyle(feature: Feature) {
    const style = resolveStyle(feature);
    if (!style) return;
    const image = style.getImage();
    const fill = image instanceof CircleStyle ? image.getFill() : style.getFill();
    const stroke = image instanceof CircleStyle ? image.getStroke() : style.getStroke();
    styleState.fillColor = colorToHex(fill?.getColor(), styleState.fillColor);
    styleState.fillOpacity = colorOpacity(fill?.getColor(), styleState.fillOpacity);
    styleState.strokeColor = colorToHex(stroke?.getColor(), styleState.strokeColor);
    styleState.strokeWidth = stroke?.getWidth() ?? styleState.strokeWidth;
    if (image instanceof CircleStyle) styleState.pointSize = image.getRadius();
  }

  function selectFeature(feature: Feature | null, openStyle = true) {
    selectedFeature.value = feature;
    if (feature) {
      readStyle(feature);
      if (openStyle) panelMode.value = 'style';
    }
  }

  function rgba(hex: string, opacity: number) {
    const [red, green, blue] = asArray(hex);
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  }

  function applyStyle() {
    const feature = selectedFeature.value;
    if (!feature || !selectedKind.value) return;
    const stroke = new Stroke({ color: styleState.strokeColor, width: styleState.strokeWidth });
    const fill = new Fill({ color: rgba(styleState.fillColor, styleState.fillOpacity) });
    const style = new Style(
      selectedKind.value === 'point'
        ? {
            image: new CircleStyle({
              radius: styleState.pointSize,
              fill,
              stroke,
            }),
          }
        : {
            fill: selectedKind.value === 'area' ? fill : undefined,
            stroke,
          },
    );
    feature.setStyle(style);
    notice.value = `${selectedKindLabel.value}已更新，并会随场景快照保存`;
  }

  function applyPreset(fillColor: string, strokeColor: string) {
    styleState.fillColor = fillColor;
    styleState.strokeColor = strokeColor;
    applyStyle();
  }

  function updateCount() {
    featureCount.value = plot.value?.plotUtils.getFeatures().length ?? 0;
  }

  function activate(type: PlotTypes) {
    if (!plot.value) return;
    plot.value.plotEdit.deactivate();
    plot.value.plotDraw.activate(type);
    selectFeature(null, false);
    activeType.value = type;
    panelMode.value = 'tools';
    notice.value = tipByType.value.get(type) ?? '在地图上依次点击控制点';
  }

  function cancelDrawing() {
    if (!plot.value || !plot.value.plotDraw.isDrawing()) return;
    plot.value.plotDraw.deactivate();
    activeType.value = null;
    notice.value = '已取消当前绘制，地图交互已恢复';
  }

  function activateSelected() {
    if (!plot.value || !selectedFeature.value || isEditing.value) return;
    cancelDrawing();
    plot.value.plotEdit.activate(selectedFeature.value);
    isEditing.value = true;
    notice.value = '图形已激活：拖动主体可平移，拖动控制点可修改几何';
  }

  function deactivateEditing() {
    if (!plot.value || !isEditing.value) return;
    plot.value.plotEdit.deactivate();
    isEditing.value = false;
    notice.value = '已取消图形激活，选择仍保留，可再次激活或修改样式';
  }

  function zoomToSelected() {
    const geometry = selectedFeature.value?.getGeometry();
    if (!map.value || !geometry) return;
    map.value.updateSize();
    map.value.getView().fit(geometry.getExtent(), {
      duration: 450,
      maxZoom: 14,
      padding: [72, 72, 72, 72],
    });
    notice.value = '已缩放到当前选中图形';
  }

  function saveScene() {
    if (!plot.value) return;
    savedScene = plot.value.plotUtils.getFeatures() as PlotSerializedFeature[];
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedScene));
      hasSavedScene.value = true;
      notice.value = `已保存 ${savedScene.length} 个图形到浏览器本地存储`;
    } catch {
      hasSavedScene.value = savedScene.length > 0;
      notice.value = `已在当前页面保存 ${savedScene.length} 个图形`;
    }
  }

  function restoreScene() {
    if (!plot.value) return;
    let snapshot = savedScene;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) snapshot = JSON.parse(stored) as PlotSerializedFeature[];
    } catch {
      // Fall back to the current-page snapshot when storage is unavailable.
    }
    if (!Array.isArray(snapshot) || snapshot.length === 0) {
      notice.value = '暂无可恢复的场景，请先保存至少一个图形';
      return;
    }
    plot.value.plotDraw.deactivate();
    plot.value.plotEdit.deactivate();
    plot.value.plotUtils.removeAllFeatures();
    plot.value.plotUtils.addFeatures(snapshot);
    selectedFeature.value = null;
    activeType.value = null;
    isEditing.value = false;
    panelMode.value = 'tools';
    notice.value = `已恢复 ${snapshot.length} 个图形及其样式`;
    updateCount();
  }

  function clearAll() {
    if (!plot.value) return;
    plot.value.plotDraw.deactivate();
    plot.value.plotEdit.deactivate();
    plot.value.plotUtils.removeAllFeatures();
    selectFeature(null, false);
    isEditing.value = false;
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
    const toMap = (coordinate: [number, number]) => fromLonLat(coordinate) as [number, number];
    const features: PlotSerializedFeature[] = [
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] },
        properties: {
          type: PlotTypes.ATTACK_ARROW,
          points: [
            [116.12, 39.72],
            [116.62, 40.02],
            [117.02, 39.66],
          ].map(toMap),
          style: {
            fill: { fillColor: 'rgba(99, 91, 255, .28)' },
            stroke: { strokeColor: '#635bff', strokeWidth: 3 },
          },
        },
      },
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] },
        properties: {
          type: PlotTypes.CIRCLE,
          points: [
            [116.35, 39.95],
            [116.48, 39.95],
          ].map(toMap),
          style: {
            fill: { fillColor: 'rgba(49, 196, 141, .18)' },
            stroke: { strokeColor: '#31c48d', strokeWidth: 2 },
          },
        },
      },
      {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [] },
        properties: {
          type: PlotTypes.FINE_ARROW,
          points: [
            [116.7, 39.55],
            [117.15, 39.9],
          ].map(toMap),
          style: {
            fill: { fillColor: 'rgba(245, 158, 11, .22)' },
            stroke: { strokeColor: '#f59e0b', strokeWidth: 2 },
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

    try {
      const stored = localStorage.getItem(storageKey);
      savedScene = stored ? (JSON.parse(stored) as PlotSerializedFeature[]) : [];
      hasSavedScene.value = savedScene.length > 0;
    } catch {
      savedScene = [];
    }

    plotInstance.plotDraw.on('drawEnd', (event) => {
      activeType.value = null;
      notice.value = '绘制完成。点击图形可拖动或调整控制点';
      if (event.feature instanceof Feature) {
        selectFeature(event.feature);
        plotInstance.plotEdit.activate(event.feature);
        isEditing.value = true;
      }
      updateCount();
    });

    plotInstance.plotEdit.on('activePlotChange', () => {
      isEditing.value = true;
    });
    plotInstance.plotEdit.on('deactivatePlot', () => {
      isEditing.value = false;
    });

    mapInstance.on('singleclick', (event) => {
      if (plotInstance.plotDraw.isDrawing()) return;
      const feature = mapInstance.forEachFeatureAtPixel(event.pixel, (candidate) => candidate);
      if (feature?.get('isPlot') && feature instanceof Feature) {
        selectFeature(feature);
        plotInstance.plotEdit.activate(feature);
        isEditing.value = true;
      } else {
        selectFeature(null, false);
        plotInstance.plotEdit.deactivate();
      }
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
      <div class="panel-tabs" role="tablist" aria-label="Playground 面板">
        <button
          type="button"
          role="tab"
          :aria-selected="panelMode === 'tools'"
          :class="{ active: panelMode === 'tools' }"
          @click="panelMode = 'tools'"
        >
          绘制工具
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="panelMode === 'style'"
          :class="{ active: panelMode === 'style' }"
          @click="panelMode = 'style'"
        >
          样式<span v-if="selectedFeature" class="selection-dot" aria-label="已选择图形"></span>
        </button>
      </div>
      <div v-if="panelMode === 'tools'" class="tool-scroll">
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
      </div>
      <div v-else class="style-editor">
        <div v-if="!selectedFeature" class="empty-selection">
          <span aria-hidden="true">◎</span>
          <strong>选择一个图形</strong>
          <p>完成绘制或点击地图中的图形后，可在这里调整颜色、边框与大小。</p>
          <button type="button" @click="panelMode = 'tools'">返回绘制工具</button>
        </div>
        <template v-else>
          <div class="selection-heading">
            <div>
              <span>当前选择</span>
              <strong>{{ selectedKindLabel }}</strong>
            </div>
            <span class="geometry-pill" :class="{ editing: isEditing }">{{ isEditing ? 'Editing' : selectedFeature.getGeometry()?.getType() }}</span>
          </div>

          <div class="edit-actions" aria-label="图形激活状态">
            <button type="button" :disabled="isEditing" @click="activateSelected">激活编辑</button>
            <button type="button" :disabled="!isEditing" @click="deactivateEditing">取消激活</button>
            <button type="button" @click="zoomToSelected">缩放到</button>
          </div>

          <fieldset v-if="selectedKind !== 'line'" class="style-group">
            <legend>填充</legend>
            <label class="color-field">
              <span>填充颜色</span>
              <input v-model="styleState.fillColor" type="color" @input="applyStyle" />
              <code>{{ styleState.fillColor }}</code>
            </label>
            <label class="range-field">
              <span>透明度 <output>{{ Math.round(styleState.fillOpacity * 100) }}%</output></span>
              <input
                v-model.number="styleState.fillOpacity"
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                @input="applyStyle"
              />
            </label>
          </fieldset>

          <fieldset class="style-group">
            <legend>{{ selectedKind === 'line' ? '线条' : '边框' }}</legend>
            <label class="color-field">
              <span>{{ selectedKind === 'line' ? '线颜色' : '边框颜色' }}</span>
              <input v-model="styleState.strokeColor" type="color" @input="applyStyle" />
              <code>{{ styleState.strokeColor }}</code>
            </label>
            <label class="range-field">
              <span>{{ selectedKind === 'line' ? '线宽' : '边框宽度' }} <output>{{ styleState.strokeWidth }} px</output></span>
              <input
                v-model.number="styleState.strokeWidth"
                type="range"
                min="1"
                max="12"
                step="1"
                @input="applyStyle"
              />
            </label>
          </fieldset>

          <fieldset v-if="selectedKind === 'point'" class="style-group">
            <legend>点符号</legend>
            <label class="range-field">
              <span>点大小 <output>{{ styleState.pointSize }} px</output></span>
              <input
                v-model.number="styleState.pointSize"
                type="range"
                min="4"
                max="28"
                step="1"
                @input="applyStyle"
              />
            </label>
          </fieldset>

          <div class="preset-row" aria-label="样式配色预设">
            <button type="button" title="靛蓝" style="--swatch: #635bff" @click="applyPreset('#635bff', '#4338ca')"></button>
            <button type="button" title="翡翠" style="--swatch: #31c48d" @click="applyPreset('#31c48d', '#047857')"></button>
            <button type="button" title="琥珀" style="--swatch: #f59e0b" @click="applyPreset('#f59e0b', '#b45309')"></button>
            <button type="button" title="玫红" style="--swatch: #f43f5e" @click="applyPreset('#f43f5e', '#be123c')"></button>
          </div>
        </template>
      </div>
      <div class="panel-actions">
        <button type="button" :disabled="!activeType" @click="cancelDrawing">取消绘制</button>
        <button type="button" @click="copyJSON">复制 JSON</button>
        <button type="button" @click="saveScene">保存场景</button>
        <button type="button" :disabled="!hasSavedScene" @click="restoreScene">恢复场景</button>
        <button type="button" class="danger full" @click="clearAll">清空画布</button>
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
    grid-template-columns: 240px minmax(0, 1fr);
    min-height: 620px;
    overflow: hidden;
    border: 1px solid var(--vp-c-divider);
    border-radius: 24px;
    background: var(--vp-c-bg);
    box-shadow: 0 24px 70px rgba(25, 25, 70, 0.12);
  }

  .tool-panel {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 20px 14px 164px;
    border-right: 1px solid var(--vp-c-divider);
    background: color-mix(in srgb, var(--vp-c-bg) 92%, #635bff 8%);
  }

  .tool-heading {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 2px 8px 14px;
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

  .panel-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin: 0 4px 14px;
    padding: 4px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 12px;
    background: color-mix(in srgb, var(--vp-c-bg) 72%, transparent);
  }
  .panel-tabs button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--vp-c-text-3);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  .panel-tabs button.active {
    background: var(--vp-c-bg);
    color: var(--vp-c-text-1);
    box-shadow: 0 4px 14px rgba(25, 25, 70, 0.08);
  }
  .selection-dot {
    width: 6px;
    height: 6px;
    margin-left: 6px;
    border-radius: 50%;
    background: #31c48d;
  }

  .tool-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-right: 2px;
  }

  .style-editor {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 2px 4px 12px;
  }
  .empty-selection {
    display: grid;
    justify-items: center;
    padding: 42px 14px;
    text-align: center;
  }
  .empty-selection > span {
    display: grid;
    width: 48px;
    height: 48px;
    place-items: center;
    margin-bottom: 14px;
    border: 1px dashed color-mix(in srgb, var(--vp-c-brand-1) 55%, var(--vp-c-divider));
    border-radius: 16px;
    color: var(--vp-c-brand-1);
    font-size: 24px;
  }
  .empty-selection strong {
    font-size: 14px;
  }
  .empty-selection p {
    margin: 7px 0 16px;
    color: var(--vp-c-text-3);
    font-size: 12px;
    line-height: 1.65;
  }
  .empty-selection button {
    padding: 8px 12px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 9px;
    background: var(--vp-c-bg);
    color: var(--vp-c-text-2);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
  .selection-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 8px 16px;
  }
  .selection-heading span,
  .selection-heading strong {
    display: block;
  }
  .selection-heading span {
    color: var(--vp-c-text-3);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .selection-heading strong {
    margin-top: 3px;
    font-size: 15px;
  }
  .selection-heading .geometry-pill {
    padding: 5px 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
    color: var(--vp-c-brand-1);
    font-family: ui-monospace, monospace;
    font-size: 9px;
    letter-spacing: 0;
    text-transform: none;
  }
  .style-group {
    min-width: 0;
    margin: 0 0 10px;
    padding: 13px 12px 14px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 14px;
    background: color-mix(in srgb, var(--vp-c-bg) 78%, transparent);
  }
  .style-group legend {
    padding: 0 5px;
    color: var(--vp-c-text-3);
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .style-group label {
    display: grid;
    color: var(--vp-c-text-2);
    font-size: 12px;
    font-weight: 650;
  }
  .style-group label + label {
    margin-top: 14px;
  }
  .color-field {
    grid-template-columns: minmax(0, 1fr) 32px auto;
    align-items: center;
    gap: 8px;
  }
  .color-field input {
    width: 32px;
    height: 28px;
    padding: 2px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    background: var(--vp-c-bg);
    cursor: pointer;
  }
  .color-field code {
    padding: 2px 0;
    background: none;
    color: var(--vp-c-text-3);
    font-size: 10px;
  }
  .range-field span {
    display: flex;
    justify-content: space-between;
    margin-bottom: 7px;
  }
  .range-field output {
    color: var(--vp-c-brand-1);
    font-family: ui-monospace, monospace;
    font-size: 10px;
  }
  .range-field input {
    width: 100%;
    accent-color: var(--vp-c-brand-1);
    cursor: pointer;
  }
  .preset-row {
    display: flex;
    gap: 8px;
    padding: 4px 8px;
  }
  .preset-row button {
    width: 28px;
    height: 28px;
    border: 4px solid var(--vp-c-bg);
    border-radius: 50%;
    outline: 1px solid var(--vp-c-divider);
    background: var(--swatch);
    cursor: pointer;
  }
  .edit-actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-bottom: 12px;
  }
  .edit-actions button {
    min-height: 34px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 10px;
    background: var(--vp-c-bg);
    color: var(--vp-c-text-2);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }
  .edit-actions button:first-child:not(:disabled) {
    border-color: var(--vp-c-brand-1);
    background: var(--vp-c-brand-1);
    color: #fff;
  }
  .edit-actions button:disabled,
  .panel-actions button:disabled {
    opacity: 0.42;
    cursor: not-allowed;
  }
  .selection-heading .geometry-pill.editing {
    background: rgba(49, 196, 141, 0.14);
    color: #19976b;
  }

  .tool-group {
    margin-top: 14px;
  }
  .tool-group:first-child {
    margin-top: 0;
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
    min-height: 36px;
    margin: 2px 0;
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
    display: grid;
    grid-template-columns: 1fr 1fr;
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
  .panel-actions button.full {
    grid-column: 1 / -1;
  }

  button:focus-visible,
  input:focus-visible {
    outline: 2px solid var(--vp-c-brand-1);
    outline-offset: 2px;
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
      grid-template-rows: 280px minmax(440px, 1fr);
      min-height: 720px;
    }
    .tool-panel {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      height: 280px;
      overflow: hidden;
      padding: 12px;
      border-right: 0;
      border-bottom: 1px solid var(--vp-c-divider);
    }
    .tool-heading,
    .tool-group p {
      display: none;
    }
    .panel-tabs {
      margin: 0 0 10px;
    }
    .tool-scroll {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      overflow-y: hidden;
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
    .style-editor {
      max-height: none;
    }
    .empty-selection {
      padding: 18px 14px;
    }
    .panel-actions {
      position: static;
      grid-template-columns: repeat(3, 1fr);
      margin-top: 10px;
    }
    .panel-actions button.full {
      grid-column: auto;
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
