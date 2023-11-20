import { Style, Circle, Stroke, Fill } from 'ol/style';

import {Group, Layer, Vector} from 'ol/layer';

import { Vector as VectorSource } from 'ol/source';

/**
 * 通过layerName获取图层
 * @param map
 * @param layerName
 * @returns {*}
 */
const getLayerByLayerName = function (map, layerName): WithNull<Layer> {
  try {
    let targetLayer = null;
    if (map) {
      const layers = map.getLayers().getArray();
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      targetLayer = getLayerInternal(layers, 'layerName', layerName);
    }
    return targetLayer;
  } catch (e) {
    console.log(e);
    return null;
  }
};

/**
 * 内部处理获取图层方法
 * @param layers
 * @param key
 * @param value
 * @returns {*}
 */
const getLayerInternal = function (layers, key, value) {
  let _target = null;
  if (layers.length > 0) {
    layers.every((layer) => {
      if (layer instanceof Group) {
        const ly = layer.getLayers().getArray();
        _target = getLayerInternal(ly, key, value);
        return !_target;
      }
      if (layer.get(key) === value) {
        _target = layer;
        return false;
      }
      return true;
    });
  }
  return _target;
};

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
      let vectorLayer = getLayerByLayerName(map, layerName);
      if (!(vectorLayer instanceof Vector)) {
        vectorLayer = null;
      }
      if (!vectorLayer) {
        if (params && params.create) {
          new Vector({
            // @ts-ignore
            layerName,
            params,
            layerType: 'vector',
            source: new VectorSource({
              wrapX: false,
            }),
            style: new Style({
              fill: new Fill({
                color: 'rgba(67, 110, 238, 0.4)',
              }),
              stroke: new Stroke({
                color: '#4781d9',
                width: 2,
              }),
              image: new Circle({
                radius: 7,
                fill: new Fill({
                  color: '#ffcc33',
                }),
              }),
            }),
          });
        }
      }
      if (map && vectorLayer) {
        if (params && params.hasOwnProperty('selectable')) {
          vectorLayer.set('selectable', params.selectable);
        }
        // 图层只添加一次
        const _vectorLayer = getLayerByLayerName(map, layerName);
        if (!_vectorLayer || !(_vectorLayer instanceof Vector)) {
          map.addLayer(vectorLayer);
        }
      }
      return vectorLayer;
    }
  } catch (e) {
    console.error(e);
  }
};

export { createVectorLayer, getLayerByLayerName };
