import $Map from 'ol/map'
import $Group from 'ol/layer/group'
import $VectorLayer from 'ol/layer/vector'
import $VectorSource from 'ol/source/vector'
import $Style from 'ol/style/style'
import $Stroke from 'ol/style/stroke'
import $Circle from 'ol/style/circle'
import $Fill from 'ol/style/fill'
const $LayerUtils = function (map) {
  if (map && map instanceof $Map) {
    this.map = map
  } else {
    throw new Error('传入的不是地图对象！')
  }
}

/**
 * 通过layerName获取图层
 * @param layerName
 * @returns {*}
 */
$LayerUtils.prototype.getLayerByLayerName = function (layerName) {
  try {
    let targetLayer = null
    if (this.map) {
      let layers = this.map.getLayers().getArray()
      targetLayer = this.getLayerInternal(layers, 'layerName', layerName)
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
$LayerUtils.prototype.getLayerInternal = function (layers, key, value) {
  let _target = null
  if (layers.length > 0) {
    layers.every(layer => {
      if (layer instanceof $Group) {
        let layers = layer.getLayers().getArray()
        _target = this.getLayerInternal(layers, key, value)
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
 * 根据相关键值键名获取图层集合
 * @param layers
 * @param key
 * @param value
 * @returns {Array}
 */
$LayerUtils.prototype.getLayersArrayInternal = function (layers, key, value) {
  let _target = []
  if (layers.length > 0) {
    layers.forEach(layer => {
      if (layer instanceof $Group) {
        let layers = layer.getLayers().getArray()
        let _layer = this.getLayersArrayInternal(layers, key, value)
        if (_layer) {
          _target = _target.concat(_layer)
        }
      } else if (layer.get(key) === value) {
        _target.push(layer)
      }
    })
  }
  return _target
}

/**
 * 通过键名键值获取图层（注意键名键值必须是set(key, value)）
 * @param key
 * @param value
 */
$LayerUtils.prototype.getLayerByKeyValue = function (key, value) {
  try {
    let targetLayer = null
    if (this.map) {
      let layers = this.map.getLayers().getArray()
      targetLayer = this.getLayerInternal(layers, key, value)
    }
    return targetLayer
  } catch (e) {
    console.log(e)
  }
}

/**
 * 通过键名键值获取图层集合（注意键名键值必须是set(key, value)）
 * @param key
 * @param value
 */
$LayerUtils.prototype.getLayersArrayByKeyValue = function (key, value) {
  try {
    let targetLayers = []
    if (this.map) {
      let layers = this.map.getLayers().getArray()
      targetLayers = this.getLayersArrayInternal(layers, key, value)
    }
    return targetLayers
  } catch (e) {
    console.log(e)
  }
}

/**
 * 创建临时图层
 * @param layerName
 * @param params
 * @returns {*}
 */
$LayerUtils.prototype.createVectorLayer = function (layerName, params) {
  try {
    if (this.map) {
      let vectorLayer = this.getLayerByLayerName(layerName)
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
      if (this.map && vectorLayer) {
        if (params && params.hasOwnProperty('selectable')) {
          vectorLayer.set('selectable', params.selectable)
        }
        // 图层只添加一次
        let _vectorLayer = this.getLayerByLayerName(layerName)
        if (!_vectorLayer || !(_vectorLayer instanceof $VectorLayer)) {
          this.map.addLayer(vectorLayer)
        }
      }
      return vectorLayer
    }
  } catch (e) {
    console.log(e)
  }
}

export default $LayerUtils
