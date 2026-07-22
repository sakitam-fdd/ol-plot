import 'ol/ol.css';
import 'ol-plot/style.css';
import './style.css';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Feature from 'ol/Feature.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import { fromLonLat } from 'ol/proj.js';
import { asArray } from 'ol/color.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import Plot, { PlotTypes, type PlotSerializedFeature } from 'ol-plot';

type GeometryKind = 'point' | 'line' | 'area';

interface DemoStyle {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  pointSize: number;
}

const toolGroups = [
  {
    label: '点线',
    items: [
      [PlotTypes.POINT, '点'],
      [PlotTypes.PENNANT, '旗标点'],
      [PlotTypes.POLYLINE, '折线'],
      [PlotTypes.CURVE, '曲线'],
      [PlotTypes.FREEHANDLINE, '自由线'],
      [PlotTypes.ARC, '圆弧'],
    ],
  },
  {
    label: '面域',
    items: [
      [PlotTypes.CIRCLE, '圆'],
      [PlotTypes.ELLIPSE, '椭圆'],
      [PlotTypes.RECTANGLE, '矩形'],
      [PlotTypes.RECTINCLINED1, '斜矩形1'],
      [PlotTypes.RECTINCLINED2, '斜矩形2'],
      [PlotTypes.POLYGON, '多边形'],
      [PlotTypes.FREE_POLYGON, '自由面'],
      [PlotTypes.LUNE, '弓形'],
      [PlotTypes.SECTOR, '扇形'],
      [PlotTypes.CLOSED_CURVE, '闭合曲面'],
      [PlotTypes.GATHERING_PLACE, '集结地'],
    ],
  },
  {
    label: '战术箭头',
    items: [
      [PlotTypes.STRAIGHT_ARROW, '直箭头'],
      [PlotTypes.FINE_ARROW, '细箭头'],
      [PlotTypes.ASSAULT_DIRECTION, '突击方向'],
      [PlotTypes.ATTACK_ARROW, '进攻箭头'],
      [PlotTypes.TAILED_ATTACK_ARROW, '燕尾进攻箭头'],
      [PlotTypes.DOUBLE_ARROW, '双箭头'],
      [PlotTypes.SQUAD_COMBAT, '分队战斗'],
      [PlotTypes.TAILED_SQUAD_COMBAT, '燕尾分队战斗'],
    ],
  },
  {
    label: '旗标与文本',
    items: [
      [PlotTypes.RECTFLAG, '矩形旗'],
      [PlotTypes.TRIANGLEFLAG, '三角旗'],
      [PlotTypes.CURVEFLAG, '曲线旗'],
      [PlotTypes.TEXTAREA, '文本框'],
    ],
  },
] as const;

const map = new Map({
  target: 'map',
  layers: [new TileLayer({ source: new OSM({ crossOrigin: 'anonymous' }) })],
  view: new View({ center: fromLonLat([105, 35]), zoom: 4.5 }),
});

const plot = new Plot(map, { pointTolerance: 5, zIndex: 30 });
const toolRoot = document.querySelector<HTMLElement>('#tools');
const activeTool = document.querySelector<HTMLElement>('#active-tool');
const featureCount = document.querySelector<HTMLElement>('#feature-count');
const notice = document.querySelector<HTMLElement>('#notice');
const stylePanel = document.querySelector<HTMLElement>('#style-panel');
const styleKind = document.querySelector<HTMLElement>('#style-kind');
const fillControls = document.querySelector<HTMLFieldSetElement>('#fill-controls');
const pointControls = document.querySelector<HTMLFieldSetElement>('#point-controls');
const fillColorInput = document.querySelector<HTMLInputElement>('#fill-color');
const fillOpacityInput = document.querySelector<HTMLInputElement>('#fill-opacity');
const strokeColorInput = document.querySelector<HTMLInputElement>('#stroke-color');
const strokeWidthInput = document.querySelector<HTMLInputElement>('#stroke-width');
const pointSizeInput = document.querySelector<HTMLInputElement>('#point-size');
const cancelDrawButton = document.querySelector<HTMLButtonElement>('#cancel-draw');
const saveButton = document.querySelector<HTMLButtonElement>('#save');
const restoreButton = document.querySelector<HTMLButtonElement>('#restore');
const activateEditButton = document.querySelector<HTMLButtonElement>('#activate-edit');
const deactivateEditButton = document.querySelector<HTMLButtonElement>('#deactivate-edit');
const editBadge = document.querySelector<HTMLElement>('#edit-badge');
let selectedFeature: Feature | null = null;
let selectedKind: GeometryKind | null = null;
let isEditing = false;
let savedScene: PlotSerializedFeature[] = [];
const storageKey = 'ol-plot:native-playground:scene';
const styleState: DemoStyle = {
  fillColor: '#635bff',
  fillOpacity: 0.28,
  strokeColor: '#4338ca',
  strokeWidth: 2,
  pointSize: 8,
};

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
  const baseStyle = plot.plotUtils.getBaseStyle(feature);
  return baseStyle instanceof Style ? baseStyle : null;
}

function getGeometryKind(feature: Feature): GeometryKind | null {
  const type = feature.getGeometry()?.getType();
  if (type === 'Point') return 'point';
  if (type === 'LineString') return 'line';
  if (type === 'Polygon') return 'area';
  return null;
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

function syncStyleControls() {
  if (styleKind) {
    styleKind.textContent =
      selectedKind === 'point' ? '点样式' : selectedKind === 'line' ? '线样式' : selectedKind === 'area' ? '面样式' : '未选择';
  }
  if (fillControls) fillControls.hidden = selectedKind === 'line';
  if (pointControls) pointControls.hidden = selectedKind !== 'point';
  if (fillColorInput) fillColorInput.value = styleState.fillColor;
  if (fillOpacityInput) fillOpacityInput.value = String(styleState.fillOpacity);
  if (strokeColorInput) strokeColorInput.value = styleState.strokeColor;
  if (strokeWidthInput) strokeWidthInput.value = String(styleState.strokeWidth);
  if (pointSizeInput) pointSizeInput.value = String(styleState.pointSize);
  document.querySelectorAll<HTMLOutputElement>('[data-output]').forEach((output) => {
    const key = output.dataset.output as keyof DemoStyle;
    const value = styleState[key];
    output.textContent = key === 'fillOpacity' ? `${Math.round(Number(value) * 100)}%` : `${value} px`;
  });
}

function setEditing(active: boolean) {
  isEditing = active;
  if (activateEditButton) activateEditButton.disabled = !selectedFeature || active;
  if (deactivateEditButton) deactivateEditButton.disabled = !active;
  if (editBadge) {
    editBadge.textContent = active ? 'EDITING' : 'SELECTED';
    editBadge.classList.toggle('editing', active);
  }
}

function selectFeature(feature: Feature | null) {
  selectedFeature = feature;
  selectedKind = feature ? getGeometryKind(feature) : null;
  if (feature) readStyle(feature);
  stylePanel?.classList.toggle('visible', !!feature && !!selectedKind);
  stylePanel?.setAttribute('aria-hidden', feature && selectedKind ? 'false' : 'true');
  syncStyleControls();
  setEditing(feature ? isEditing : false);
}

function rgba(hex: string, opacity: number) {
  const [red, green, blue] = asArray(hex);
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function applyStyle() {
  if (!selectedFeature || !selectedKind) return;
  const fill = new Fill({ color: rgba(styleState.fillColor, styleState.fillOpacity) });
  const stroke = new Stroke({ color: styleState.strokeColor, width: styleState.strokeWidth });
  selectedFeature.setStyle(
    new Style(
      selectedKind === 'point'
        ? { image: new CircleStyle({ radius: styleState.pointSize, fill, stroke }) }
        : { fill: selectedKind === 'area' ? fill : undefined, stroke },
    ),
  );
  syncStyleControls();
  setStatus('样式编辑', '颜色、边框与大小已更新，并会随场景快照保存');
}

function updateCount() {
  if (featureCount) featureCount.textContent = String(plot.plotUtils.getFeatures().length);
}

function setStatus(label: string, message: string) {
  if (activeTool) activeTool.textContent = label;
  if (notice) notice.textContent = message;
}

toolGroups.forEach((group, groupIndex) => {
  const section = document.createElement('section');
  const heading = document.createElement('h2');
  heading.textContent = group.label;
  section.appendChild(heading);
  group.items.forEach(([type, label], itemIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.type = type;
    button.innerHTML = `<span>${String(groupIndex * 10 + itemIndex + 1).padStart(2, '0')}</span>${label}`;
    button.addEventListener('click', () => {
      plot.plotEdit.deactivate();
      plot.plotDraw.activate(type);
      selectFeature(null);
      if (cancelDrawButton) cancelDrawButton.disabled = false;
      document.querySelectorAll('.tools button').forEach((item) => item.classList.toggle('active', item === button));
      setStatus(label, '在地图上依次点击控制点；自由图形请双击或再次单击结束');
    });
    section.appendChild(button);
  });
  toolRoot?.appendChild(section);
});

plot.plotDraw.on('drawEnd', (event: any) => {
  document.querySelectorAll('.tools button').forEach((item) => item.classList.remove('active'));
  if (cancelDrawButton) cancelDrawButton.disabled = true;
  setStatus('未选择', '绘制完成。点击图形可拖动或调整控制点');
  if (event.feature instanceof Feature) {
    selectFeature(event.feature);
    plot.plotEdit.activate(event.feature);
    setEditing(true);
  }
  updateCount();
});

plot.plotEdit.on('activePlotChange', () => setEditing(true));
plot.plotEdit.on('deactivatePlot', () => setEditing(false));

map.on('singleclick', (event) => {
  if (plot.plotDraw.isDrawing()) return;
  const feature = map.forEachFeatureAtPixel(event.pixel, (candidate) => candidate);
  if (feature?.get('isPlot') && feature instanceof Feature) {
    selectFeature(feature);
    plot.plotEdit.activate(feature);
    setEditing(true);
  } else {
    selectFeature(null);
    plot.plotEdit.deactivate();
  }
});

cancelDrawButton?.addEventListener('click', () => {
  if (!plot.plotDraw.isDrawing()) return;
  plot.plotDraw.deactivate();
  document.querySelectorAll('.tools button').forEach((item) => item.classList.remove('active'));
  cancelDrawButton.disabled = true;
  setStatus('未选择', '已取消当前绘制，地图交互已恢复');
});

activateEditButton?.addEventListener('click', () => {
  if (!selectedFeature || isEditing) return;
  plot.plotDraw.deactivate();
  if (cancelDrawButton) cancelDrawButton.disabled = true;
  plot.plotEdit.activate(selectedFeature);
  setEditing(true);
  setStatus('编辑中', '拖动主体可平移，拖动控制点可修改几何');
});

deactivateEditButton?.addEventListener('click', () => {
  if (!isEditing) return;
  plot.plotEdit.deactivate();
  setEditing(false);
  setStatus('已选择', '图形已取消激活，仍可修改样式或再次激活');
});

const styleInputs: [HTMLInputElement | null, keyof DemoStyle, (value: string) => string | number][] = [
  [fillColorInput, 'fillColor', String],
  [fillOpacityInput, 'fillOpacity', Number],
  [strokeColorInput, 'strokeColor', String],
  [strokeWidthInput, 'strokeWidth', Number],
  [pointSizeInput, 'pointSize', Number],
];

styleInputs.forEach(([input, key, parse]) => {
  input?.addEventListener('input', () => {
    (styleState as any)[key] = parse(input.value);
    applyStyle();
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => {
  button.addEventListener('click', () => {
    styleState.fillColor = button.dataset.fill || styleState.fillColor;
    styleState.strokeColor = button.dataset.stroke || styleState.strokeColor;
    applyStyle();
  });
});

document.querySelector('#clear')?.addEventListener('click', () => {
  plot.plotDraw.deactivate();
  plot.plotEdit.deactivate();
  plot.plotUtils.removeAllFeatures();
  selectFeature(null);
  if (cancelDrawButton) cancelDrawButton.disabled = true;
  setStatus('未选择', '画布已清空');
  updateCount();
});

saveButton?.addEventListener('click', () => {
  savedScene = plot.plotUtils.getFeatures() as PlotSerializedFeature[];
  try {
    localStorage.setItem(storageKey, JSON.stringify(savedScene));
  } catch {
    // The in-memory snapshot remains available when storage is blocked.
  }
  if (restoreButton) restoreButton.disabled = savedScene.length === 0;
  setStatus('场景已保存', `已保存 ${savedScene.length} 个图形及其样式`);
});

restoreButton?.addEventListener('click', () => {
  let snapshot = savedScene;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) snapshot = JSON.parse(stored) as PlotSerializedFeature[];
  } catch {
    // Fall back to the in-memory snapshot.
  }
  if (!Array.isArray(snapshot) || snapshot.length === 0) {
    setStatus('未选择', '暂无可恢复的场景，请先保存至少一个图形');
    return;
  }
  plot.plotDraw.deactivate();
  plot.plotEdit.deactivate();
  plot.plotUtils.removeAllFeatures();
  plot.plotUtils.addFeatures(snapshot);
  selectFeature(null);
  if (cancelDrawButton) cancelDrawButton.disabled = true;
  setStatus('场景已恢复', `已恢复 ${snapshot.length} 个图形及其样式`);
  updateCount();
});

document.querySelector('#export')?.addEventListener('click', async () => {
  const snapshot = plot.plotUtils.getFeatures();
  try {
    await navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
    setStatus('未选择', `已复制 ${snapshot.length} 个标绘要素的 JSON`);
  } catch {
    setStatus('未选择', '浏览器未开放剪贴板权限');
  }
});

try {
  const stored = localStorage.getItem(storageKey);
  savedScene = stored ? (JSON.parse(stored) as PlotSerializedFeature[]) : [];
  if (restoreButton) restoreButton.disabled = savedScene.length === 0;
} catch {
  savedScene = [];
}

window.addEventListener('beforeunload', () => plot.destroy(), { once: true });
