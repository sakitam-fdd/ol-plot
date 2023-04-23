import 'ol/ol.css';
import 'ol-plot/dist/ol-plot.css';
import { Map, View } from 'ol';
import { Tile } from 'ol/layer';
import { OSM } from 'ol/source';

import Plot from 'ol-plot';

const map = new Map({
  layers: [
    new Tile({
      source: new OSM({
        url: 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}',
      }),
    }),
  ],
  view: new View({
    // center: [108.93, 34.27],
    center: [12095486.34146684, 4085090.6140265367],
    projection: 'EPSG:3857',
    zoom: 5,
  }),
  target: 'map',
});

/* eslint-disable-next-line */
const plot = new Plot(map, {
  zoomToExtent: true,
});

map.on('click', function (event) {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
    return feature;
  });
  if (feature && feature.get('isPlot') && !plot.plotDraw.isDrawing()) {
    plot.plotEdit.activate(feature);
  } else {
    plot.plotEdit.deactivate();
  }
});

// 绘制结束后，添加到FeatureOverlay显示。
function onDrawEnd(event) {
  console.log(event);
  const feature = event.feature;
  // 开始编辑
  plot.plotEdit.activate(feature);
}

plot.plotDraw.on('drawStart', (e) => {
  console.log(e);
});
plot.plotDraw.on('drawEnd', onDrawEnd);

plot.plotEdit.on('activePlotChange', (e) => {
  console.log(e);
});
plot.plotEdit.on('deactivatePlot', (e) => {
  console.log(e);
});

plot.on('activeTextArea', function (event) {
  const style = event.overlay.getStyle();
  console.log(style);
});
plot.on('deactivateTextArea', function (event) {
  const style = event.overlay.getStyle();
  console.log(style);
});

// 指定标绘类型，开始绘制。
function activate(type) {
  plot.plotEdit.deactivate();
  plot.plotDraw.activate(type);
}

function getFeatures() {
  const features = plot.plotUtils.getFeatures();
  console.log(JSON.stringify(features));
  plot.plotUtils.removeAllFeatures();
  plot.plotEdit.deactivate();
  plot.plotUtils.addFeatures(features);
}

window.plot = plot;
window.activate = activate;
window.getFeatures = getFeatures;
