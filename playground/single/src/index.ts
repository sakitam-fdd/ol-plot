import 'ol/ol.css';
import 'ol-plot/style.css';
import './style.css';

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import { fromLonLat } from 'ol/proj.js';
import Plot, { PlotTypes } from 'ol-plot';

const toolGroups = [
  {
    label: '基础图形',
    items: [
      [PlotTypes.POINT, '点'],
      [PlotTypes.POLYLINE, '折线'],
      [PlotTypes.CURVE, '曲线'],
      [PlotTypes.CIRCLE, '圆'],
      [PlotTypes.ELLIPSE, '椭圆'],
      [PlotTypes.RECTANGLE, '矩形'],
      [PlotTypes.POLYGON, '多边形'],
      [PlotTypes.SECTOR, '扇形'],
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
    ],
  },
  {
    label: '区域与旗标',
    items: [
      [PlotTypes.CLOSED_CURVE, '闭合曲面'],
      [PlotTypes.GATHERING_PLACE, '集结地'],
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
      document.querySelectorAll('.tools button').forEach((item) => item.classList.toggle('active', item === button));
      setStatus(label, '在地图上依次点击控制点；自由图形请双击结束');
    });
    section.appendChild(button);
  });
  toolRoot?.appendChild(section);
});

plot.plotDraw.on('drawEnd', (event: any) => {
  document.querySelectorAll('.tools button').forEach((item) => item.classList.remove('active'));
  setStatus('未选择', '绘制完成。点击图形可拖动或调整控制点');
  if (event.feature) plot.plotEdit.activate(event.feature);
  updateCount();
});

map.on('singleclick', (event) => {
  if (plot.plotDraw.isDrawing()) return;
  const feature = map.forEachFeatureAtPixel(event.pixel, (candidate) => candidate);
  if (feature?.get('isPlot')) plot.plotEdit.activate(feature);
  else plot.plotEdit.deactivate();
});

document.querySelector('#clear')?.addEventListener('click', () => {
  plot.plotDraw.deactivate();
  plot.plotEdit.deactivate();
  plot.plotUtils.removeAllFeatures();
  setStatus('未选择', '画布已清空');
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

window.addEventListener('beforeunload', () => plot.destroy(), { once: true });
