import {
  Style as $Style,
  Stroke as $Stroke,
  Fill as $Fill,
  Circle as $Circle
} from 'ol/style'

import {
  Group as $Group,
  Vector as $VectorLayer
} from 'ol/layer'

import { Vector as $VectorSource } from 'ol/source'

/**
 * 通过layerName获取图层
 * @param map
 * @param layerName
 * @returns {*}
 */
const getLayerByLayerName = function (map, layerName) {
  try {
    let targetLayer = null
    if (map) {
      let layers = map.getLayers().getArray()
      targetLayer = getLayerInternal(layers, 'layerName', layerName)
    }
    return targetLayer
  } catch (e) {
    console.log(e)
  }
}

/**
 * 内部处理获取图层方法
 * @param layers
 * @param key
 * @param value
 * @returns {*}
 */
const getLayerInternal = function (layers, key, value) {
  let _target = null
  if (layers.length > 0) {
    layers.every(layer => {
      if (layer instanceof $Group) {
        let layers = layer.getLayers().getArray()
        _target = getLayerInternal(layers, key, value)
        if (_target) {
          return false
        } else {
          return true
        }
      } else if (layer.get(key) === value) {
        _target = layer
        return false
      } else {
        return true
      }
    })
  }
  return _target
}

/**
 * 创建临时图层
 * @param map
 * @param layerName
 * @param params
 * @returns {*}
 */
const createVectorLayer = function (map, layerName, params) {
  try {
    if (map) {
      let vectorLayer = getLayerByLayerName(map, layerName)
      if (!(vectorLayer instanceof $VectorLayer)) {
        vectorLayer = null
      }
      if (!vectorLayer) {
        if (params && params.create) {
          vectorLayer = new $VectorLayer({
            layerName: layerName,
            params: params,
            layerType: 'vector',
            source: new $VectorSource({
              wrapX: false
            }),
            style: new $Style({
              fill: new $Fill({
                color: 'rgba(67, 110, 238, 0.4)'
              }),
              stroke: new $Stroke({
                color: '#4781d9',
                width: 2
              }),
              image: new $Circle({
                radius: 7,
                fill: new $Fill({
                  color: '#ffcc33'
                })
              })
            })
          })
        }
      }
      if (map && vectorLayer) {
        if (params && params.hasOwnProperty('selectable')) {
          vectorLayer.set('selectable', params.selectable)
        }
        // 图层只添加一次
        let _vectorLayer = getLayerByLayerName(map, layerName)
        if (!_vectorLayer || !(_vectorLayer instanceof $VectorLayer)) {
          map.addLayer(vectorLayer)
        }
      }
      return vectorLayer
    }
  } catch (e) {
    console.log(e)
  }
}

export {
  createVectorLayer,
  getLayerByLayerName
}
