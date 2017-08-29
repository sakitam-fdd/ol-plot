/**
 * Created by FDD on 2017/8/29.
 * @desc 采用openlayers内置文本样式构造动态文本框
 */
import mixin from '../utils/mixins'
import {getuuid} from '../utils/utils'
import * as Events from 'nature-dom-util/src/events/Events'
import {DYNAMIC_TEXT_LAYERNAME} from '../constants'
import Observable from 'observable-emit'
class StyleText extends mixin(Observable) {
  constructor (map) {
    super()
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
    this.textOverlay = null
    this.draw = null
    this.vectorLayer = this.createVectorLayer(DYNAMIC_TEXT_LAYERNAME, {
      selectable: false,
      create: true
    })
    this.activeInteraction()
    Observable.call(this)
  }

  /**
   * 通过layerName获取图层
   * @param layerName
   * @returns {*}
   */
  getLayerByLayerName (layerName) {
    try {
      let targetLayer = null
      if (this.map) {
        let layers = this.map.getLayers().getArray()
        layers.every(layer => {
          if (layer.get('layerName') === layerName && layer instanceof ol.layer.Vector) {
            targetLayer = layer
            return false
          } else {
            return true
          }
        })
      }
      return targetLayer
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
  createVectorLayer (layerName, params) {
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
                  color: 'rgba(255, 255, 255, 0.7)'
                }),
                stroke: new ol.style.Stroke({
                  color: 'rgba(255, 0, 0, 0.8)',
                  width: 2
                }),
                image: new ol.style.Circle({
                  radius: 7,
                  fill: new ol.style.Fill({
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

  /**
   * 激活交互工具
   */
  activeInteraction () {
    this.draw = new ol.interaction.Draw({
      // source: this.vectorLayer.getSource(),
      type: 'Circle',
      geometryFunction: ol.interaction.Draw.createBox()
    })
    this.map.addInteraction(this.draw)
    this.draw.on('drawend', this.drawEnd, this)
  }

  /**
   * 交互结束事件
   * @param event
   */
  drawEnd (event) {
    if (event && event.feature) {
      this.feature = event.feature
      this.map.removeInteraction(this.draw)
      let modify = new ol.interaction.Modify({source: this.vectorLayer.getSource()})
      this.map.addInteraction(modify)
      let extent = event.feature.getGeometry().getExtent()
      this.center = ol.extent.getCenter(extent)
      let topLeft = this.map.getPixelFromCoordinate([extent[0], extent[1]])
      let bottomRight = this.map.getPixelFromCoordinate([extent[2], extent[3]])
      this.updateTextArea({
        center: this.center,
        width: Math.abs(topLeft[0] - bottomRight[0]),
        height: Math.abs(topLeft[1] - bottomRight[1])
      })
    } else {
      console.info('未获取到要素！')
    }
  }

  /**
   * 创建textArea
   */
  creatTextArea (params) {
    let _id = getuuid()
    let text = document.createElement('textarea')
    text.style.width = params['width'] + 'px'
    text.style.height = params['height'] + 'px'
    text.setAttribute('autofocus', true)
    text.setAttribute('id', _id)
    text.setAttribute('data-coordinates', JSON.stringify(params['center']))
    text.className = 'ol-plot-text-area'
    Events.listen(text, 'blur', this.textOnBlur, this)
    Events.listen(text, 'focus', this.textOnFocus, this)
    this.textOverlay = new ol.Overlay({
      id: _id,
      element: text,
      position: params['center'],
      positioning: 'center-center'
    })
    this.map.addOverlay(this.textOverlay)
  }

  /**
   * 失去焦点时渲染为feature
   * @param event
   */
  textOnBlur (event) {
    let textStyle = this.decodeTextAreaToStyle(event)
    let _style = this.vectorLayer.getStyle().clone()
    _style.setText(textStyle)
    this.feature.setStyle(_style)
    let _id = this.textOverlay.getElement().getAttribute('id')
    let overlay_ = this.map.getOverlayById(_id)
    this.map.removeOverlay(overlay_)
    this.vectorLayer.getSource().addFeature(this.feature)
  }

  /**
   * 获取字体样式信息
   * @param event
   * @returns {ol.style.Text}
   */
  decodeTextAreaToStyle (event) {
    let text = new ol.style.Text({
      font: '',
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      rotateWithView: true,
      rotation: 0,
      text: event.target.value,
      textAlign: 'start',
      textBaseline: 'alphabetic',
      fill: new ol.style.Fill({
        color: '#333'
      }),
      stroke: undefined
    })
    return text
  }

  /**
   * 获取焦点时恢复文本框
   * @param event
   */
  textOnFocus (event) {
    console.log(event)
  }

  /**
   * 更新文本框
   * @param params
   */
  updateTextArea (params) {
    if (!this.textOverlay) {
      this.creatTextArea(params)
    } else {
      let text = this.textOverlay.getElement()
      text.style.width = params['width'] + 'px'
      text.style.height = params['height'] + 'px'
      text.setAttribute('data-coordinates', JSON.stringify(params['center']))
      this.textOverlay.setElement(text)
    }
  }
}

export default StyleText

