ol.layer.LayerUtils = function (map) {
  if (map && map instanceof ol.Map) {
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
ol.layer.LayerUtils.prototype.getLayerByLayerName = function (layerName) {
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
ol.layer.LayerUtils.prototype.getLayerInternal = function (layers, key, value) {
  let _target = null
  if (layers.length > 0) {
    layers.every(layer => {
      if (layer instanceof ol.layer.Group) {
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
ol.layer.LayerUtils.prototype.getLayersArrayInternal = function (layers, key, value) {
  let _target = []
  if (layers.length > 0) {
    layers.forEach(layer => {
      if (layer instanceof ol.layer.Group) {
        let layers = layer.getLayers().getArray()
        _target = this.getLayerInternal(layers, key, value)
        if (_target) {
          _target.push(layer)
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
ol.layer.LayerUtils.prototype.getLayerByKeyValue = function (key, value) {
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
ol.layer.LayerUtils.prototype.getLayersArrayByKeyValue = function (key, value) {
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
ol.layer.LayerUtils.prototype.createVectorLayer = function (layerName, params) {
  try {
    if (this.map) {
      let vectorLayer = this.getLayerByLayerName(layerName)
      if (!(vectorLayer instanceof ol.layer.Vector)) {
        vectorLayer = null
      }
      if (!vectorLayer) {
        if (params && params.create) {
          vectorLayer = new ol.layer.Vector({
            layerName: layerName,
            params: params,
            layerType: 'vector',
            source: new ol.source.Vector({
              wrapX: false
            }),
            style: new ol.style.Style({
              fill: new ol.style.Fill({
                color: 'rgba(67, 110, 238, 0.4)'
              }),
              stroke: new ol.style.Stroke({
                color: '#7DC826',
                width: 2.5
              }),
              image: new ol.style.Icon({
                anchor: [0.5, 1],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                opacity: 0.75,
                src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADQ0lEQVRYR8VXTVIaURD+evABi0BYWhVJdJEEVsETBE8gngA4QfAEkhMIJ9CcQDyB4wkkK0w2EjFVWSJkAfPgderNODplzb+LvO3MdH+vv6/76yH850MvyT/axHZ+genOFNO0cRIBuCmhtCyKJoAWQLVnScfEbJJC/8NvOYwLKBYAO3FBHIGoYwdm/g6GyQbZNyfFJRDqIPr08NxkKdvVPxhHAYkE8KOcaTAZJwCVmPkSUrZ04NHWRp0MJ2FG8fD93epSUwIhTonoM8BTYtX+OFkPwkCEAhiVRYuITpxLczs/lwOrII6ZqOUXlJhPs3N5uCiIhvsd8fogDEQggJ9vRE1l6MpNnlEYqgwudCXCy8pTY429tYGaA4KnuZncCRJqIIBRWZh2KRX3eSV7lBVX0cldaDxlS+5CiC4RNZn5W3Ui/avmdxuH98wZwPe5mdxeFMTA4TXBYTZzc3mwLIoxQK/Zsnb8ROlbgest0YNBXzTyjELPpSJBevtVY827awMdXQWADyu3svc8hi8At/xaQIoyNQKOkia3tQN8BfNYa0F3UHUi64kAsFJ7REYHhP00AMA4Z1Y9MoyL1ABApIWUjP8HtPbcYO6mAaCHSdOuAKih9ZCqArqDwIPEAK7fig5Ax1o4zJi6QyUpCD28iFCyYynuV+6kM8o9x1+Em9imbPYG4GFuJvfcVkoGwGnhZUGY2iN0R/iZVNggeqQBhlFP2gl2ByhlhpXfNrKgWzlmY1y4VVgURM/p5+ij50d+LjvLotCju6a1VL1bmb7+ERZuVLadrQnGIDe32stXohspSMX93F/ZdZPrVqxMrEZQnlA3fFhA7FGqK8GWPLDLtiH0bPD6v7MfrJxJR1lx5iwsjg7CNqaY+4D2Bedoy2WoQWWyPvfeSvsHYOx7rTrKikM14A3+SEU0/U9vRJT+8UJxYmoqFsXskIB3cd5n4Fd+ZtXiLKuRFLgJvQtKFIgw1ccaREEJniZkMATd/9VbqxsFMhEF3mDX5ewgyB2DHC8MTGwK3CBBekjCuxdQYgD6Y0cPMJ35oA/fG2vUk/yQpKbA/fD5yl6dyNO4vL+4Am4AvTvqv6MkontRF6S5YdQ3qTQQFTTJ83/+27ww2VdnUwAAAABJRU5ErkJggg=='
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
        if (!_vectorLayer || !(_vectorLayer instanceof ol.layer.Vector)) {
          this.map.addLayer(vectorLayer)
        }
      }
      return vectorLayer
    }
  } catch (e) {
    console.log(e)
  }
}

let olLayerLayerUtils = ol.layer.LayerUtils
export default olLayerLayerUtils
