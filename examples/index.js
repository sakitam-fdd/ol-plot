import { Map, View } from 'ol'
import { Tile } from 'ol/layer'
import BaiDu from './source/BaiDu'

import olPlot from '../'

const gaodeMapLayer = new Tile({
  source: new BaiDu({
    projection: 'EPSG:3857',
    origin: [43.88955327932, 12.590178885765],
    url: 'http://shangetu{0-3}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46&app=webearth2&v=009&udt=20170908'
  })
})

const map = new Map({
  layers: [gaodeMapLayer],
  view: new View({
    // center: [108.93, 34.27],
    center: [12095486.34146684, 4085090.6140265367],
    projection: 'EPSG:3857',
    zoom: 5
  }),
  target: 'map'
})

/* eslint-disable-next-line */
const plot = new olPlot(map, {
  zoomToExtent: true
})

map.on('click', function (event) {
  console.log(event)
  const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
    return feature
  })
  if (feature && feature.get('isPlot') && !plot.plotDraw.isDrawing()) {
    plot.plotEdit.activate(feature)
  } else {
    plot.plotEdit.deactivate()
  }
})

// 绘制结束后，添加到FeatureOverlay显示。
function onDrawEnd (event) {
  const feature = event.feature
  // 开始编辑
  plot.plotEdit.activate(feature)
}

plot.plotDraw.on('drawEnd', onDrawEnd)
plot.plotDraw.on('active_textArea', function (event) {
  const style = plot.plotUtils.getPlotTextStyleCode(event.overlay)
  console.log(style)
})

// 指定标绘类型，开始绘制。
function activate (type) {
  plot.plotEdit.deactivate()
  plot.plotDraw.active(type)
}

function getFeatures () {
  const features = plot.plotUtils.getFeatures()
  console.log(JSON.stringify(features))
  plot.plotUtils.removeAllFeatures()
  plot.plotEdit.deactivate()
  plot.plotUtils.addFeatures(features)
}

window.activate = activate
window.getFeatures = getFeatures
