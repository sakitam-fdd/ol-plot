/**
 * Created by FDD on 2017/9/11.
 * @desc 文本标绘修复版
 */
import {getuuid} from 'nature-dom-util/src/utils/utils'
import * as Events from 'nature-dom-util/src/events/Events'
import EventType from '../../Event/EventType'
import html2canvas from 'html2canvas'
import autosize from 'autosize'
import { DEF_TEXT_STYEL } from '../../Constants'
class TextArea {
  constructor (map, layer, params = {}) {
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
    if (layer && layer instanceof ol.layer.Vector) {
      this.vectorLayer = layer
    } else {
      throw new Error('缺少必要矢量图层！')
    }

    /**
     * 当前地图容器
     * @type {Element}
     */
    this.mapViewport = this.map.getViewport()

    /**
     * 当前配置
     * @type {{}}
     */
    this.options = params
    /**
     * 文本框
     * @type {null}
     */
    this.textOverlay = null

    /**
     * 交互工具
     * @type {null}
     */
    this.draw = null

    /**
     * 当前鼠标位置对于坐标
     * @type {null}
     * @private
     */
    this.coordinate_ = null

    /**
     * 当前是否正在移动
     * @type {boolean}
     */
    this.isMoveing = false

    /**
     * 当前随机id（标识当前唯一）
     */
    this._uuid = getuuid()
    this.activeInteraction()
    this.map.getView().on('change:resolution', this._handleResolutionChange, this)
  }

  /**
   * 激活交互工具
   */
  activeInteraction () {
    this.draw = new ol.interaction.Draw({
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.7)'
        }),
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 0, 0, 0.8)',
          width: 2
        }),
        image: new ol.style.Icon({
          anchor: [1, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          opacity: 0.75,
          src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABgklEQVQ4T41T0W3CQAy1lfwRqR0h/CE5UhkBJmiZADpB0wlKJwA2aDegE5QR+Igl/noj9OPuLydXPuXQEYUKS5FyPvvd87ONRDRFxEdr7c4Y8ws3WFmW90VRvIjIF1ZVtQaANxH59N6v8zwvRaQEgCMATDu88I+Ipm1bk2XZHhEfAOAdFW00Gh2YOQafOeidHoaYEdGHc65GDZhMJuXpdDJ99hqkPmZe9e9iTgCoqmrWNM0hDerq/FGftXbcZxFzAgARrZg5vBaNiGpE3OhZRF6Zedu7DzkRYMrMKlQKYBBRQVVgw8zj3n3IGWSg9ESkds6tiqJQbe4AYJ6WGVkPAqh4+romdP9LbXMqZh/gXIKqm+d5EK9vbduOY7d0AAdL6AYLmqbRAQtGRMc4ONF/wSC2RF/PsuwbABapqLEjKqb3fq4sLtoYh6Lbiydr7TbtuwYDgH5qB9XmPEjdKG+Y+Xmo7ms+Lcs5N0uX6ei9X9y4TGtEXIZlukb7PzbdmNcisv8DtQILak2vZsYAAAAASUVORK5CYII='
        })
      }),
      type: 'Circle',
      geometryFunction: ol.interaction.Draw.createBox()
    })
    this.map.addInteraction(this.draw)
    this.draw.on('drawend', this.drawEnd, this)
  }

  /**
   * 处理分辨率变化事件
   * @param event
   * @private
   */
  _handleResolutionChange (event) {
    if (this.options['zoomWithView'] && this.feature && this.feature instanceof ol.Feature) {
      let attr = this.feature.getProperties()
      let _style = new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [1, 0],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          opacity: 0.75,
          src: attr.src,
          scale: (attr['resolution'] / event.target.getResolution())
        })
      })
      this.feature.setStyle(_style)
      this.map.render()
    }
  }

  /**
   * 交互结束事件
   * @param event
   */
  drawEnd (event) {
    if (event && event.feature) {
      this.map.removeInteraction(this.draw)
      this.labelGeomtory = event.feature.getGeometry()
      let extent = event.feature.getGeometry().getExtent()
      this.center = [extent[0], extent[3]]
      let topLeft = this.map.getPixelFromCoordinate([extent[0], extent[1]])
      let bottomRight = this.map.getPixelFromCoordinate([extent[2], extent[3]])
      this.updateTextArea({
        center: this.center,
        width: parseInt(Math.abs(topLeft[0] - bottomRight[0])),
        height: parseInt(Math.abs(topLeft[1] - bottomRight[1]))
      })
    } else {
      console.info('未获取到要素！')
    }
  }

  /**
   * 创建textArea
   */
  creatTextArea (params) {
    let content = document.createElement('div')
    content.className = 'ol-plot-text-area-content'
    let text = document.createElement('textarea')
    let editer = document.createElement('span')
    editer.className = 'ol-plot-text-area-editor'
    text.style.width = params['width'] + 'px'
    text.style.height = params['height'] + 'px'
    text.setAttribute('autofocus', true)
    text.setAttribute('id', this._uuid)
    text.setAttribute('data-coordinates', JSON.stringify(params['center']))
    text.className = 'ol-plot-text-area'
    autosize(text)
    Events.listen(text, 'blur', this.textOnBlur, this)
    Events.listen(text, 'focus', this.textOnFocus, this)
    Events.listen(text, 'autosize:resized', this.textResized)
    Events.listen(editer, EventType.MOUSEDOWN, this.mouseDownHandle_, this)
    Events.addListener(editer, 'mousemove', this.controlPointMouseMoveHandler2, this)
    content.appendChild(text)
    content.appendChild(editer)
    this.textOverlay = new ol.Overlay({
      id: this._uuid,
      element: content,
      position: params['center'],
      positioning: 'right-top'
    })
    this.setTextAreaStyle(DEF_TEXT_STYEL)
    this.map.addOverlay(this.textOverlay)
    this.map.render()
  }

  /**
   * 开启事件监听
   * @private
   */
  mouseDownHandle_ () {
    this.isMoveing = true
    Events.listen(this.mapViewport, EventType.MOUSEMOVE, this.controlPointMouseMoveHandler_, this, false)
    Events.listen(this.mapViewport, EventType.MOUSEUP, this.controlPointMouseUpHandler_, this, false)
  }

  /**
   * 对控制点的移动
   * @param event
   * @private
   */
  controlPointMouseMoveHandler_ (event) {
    let coordinate = this.map.getCoordinateFromPixel([event.offsetX, event.offsetY])
    if (this.textOverlay) {
      let content = this.textOverlay.getElement()
      let text = content.firstElementChild
      text.setAttribute('data-coordinates', JSON.stringify(coordinate))
      this.textOverlay.setPosition(coordinate)
      this.map.render()
    }
  }

  /**
   * 阻止默认事件
   * @param event
   */
  controlPointMouseMoveHandler2 (event) {
    event.stopImmediatePropagation()
  }

  /**
   * 鼠标抬起移除事件监听
   * @private
   */
  controlPointMouseUpHandler_ () {
    this.isMoveing = false
    Events.unListen(this.mapViewport, EventType.MOUSEMOVE, this.controlPointMouseMoveHandler_, this)
    Events.unListen(this.mapViewport, EventType.MOUSEUP, this.controlPointMouseUpHandler_, this)
  }

  /**
   * 失去焦点时渲染为feature
   * @param event
   */
  textOnBlur (event) {
    if (!this.isMoveing) {
      this.getImage(event.target).then(icon => {
        let content = this.textOverlay.getElement()
        let text = content.firstElementChild
        let coordinates = text.getAttribute('data-coordinates')
        this.feature = new ol.Feature({
          geometry: new ol.geom.Point(JSON.parse(coordinates))
        })
        let _labelFeature = new ol.Feature({
          geometry: this.labelGeomtory
        })
        this.feature.setId(this._uuid)
        this.feature.setProperties({
          coordinates: JSON.parse(coordinates),
          isPlotText: true,
          layerName: this.vectorLayer.get('layerName'),
          id: this._uuid,
          src: icon.src,
          resolution: this.map.getView().getResolution(),
          labelFeature: _labelFeature
        })
        let _style = new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0, 0],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            opacity: 0.75,
            src: icon.src
          })
        })
        _labelFeature.setStyle(new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0)'
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(255, 0, 0, 0)',
            width: 2
          })
        }))
        this.feature.setStyle(_style)
        this.feature.set('_text_area_source_', this)
        this.feature.set('isPlot', true)
        this.vectorLayer.getSource().addFeature(this.feature)
        let overlay_ = this.map.getOverlayById(this._uuid)
        this.map.removeOverlay(overlay_)
      })
    }
  }

  /**
   * 获取焦点时恢复文本框
   * @param event
   */
  textOnFocus (event) {
    console.log(event)
  }

  /**
   * 文本框大小变化
   * @param event
   */
  textResized (event) {
    this.style.width = parseInt(this.offsetWidth) + 'px'
    this.style.height = parseInt(this.offsetHeight) + 'px'
  }

  /**
   * 更新文本框
   * @param params
   */
  updateTextArea (params) {
    if (!this.textOverlay) {
      this.creatTextArea(params)
    } else {
      let content = this.textOverlay.getElement()
      let text = content.firstElementChild
      text.setAttribute('data-coordinates', JSON.stringify(this.center))
      this.textOverlay.setPosition(this.center)
      this.textOverlay.setElement(content)
      this.map.render()
    }
  }

  /**
   * 获取dom canvas
   * @param data
   * @returns {*}
   */
  getCanvas (data) {
    try {
      return html2canvas(data)
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 获取dom image
   * @param data
   * @returns {Promise.<T>|*}
   */
  getImage (data) {
    try {
      let image_ = html2canvas(data).then(canvas => {
        let _image = new Image()
        _image.src = canvas.toDataURL('image/png')
        return new Promise((resolve) => {
          resolve(_image)
        })
      }).catch(error => {
        console.info(error)
      })
      return image_
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 处理对当前要素点击事件
   */
  featureOnFocus () {
    if (this.textOverlay && this.textOverlay instanceof ol.Overlay) {
      this.map.addOverlay(this.textOverlay)
      this.vectorLayer.getSource().removeFeature(this.feature)
      this.map.render()
    }
  }

  /**
   * 设置样式
   * @param params
   */
  setTextAreaStyle (params) {
    if (this.textOverlay && params) {
      let content = this.textOverlay.getElement()
      let text = content.firstElementChild
      for (let key in params) {
        if (key && params[key]) {
          text.style[key] = params[key]
        }
      }
      this.textOverlay.setElement(content)
      this.map.render()
    }
  }

  /**
   * 获取空间信息
   * @returns {ol.geom.Point}
   */
  getGeometry () {
    return new ol.geom.Point(this.center)
  }
}
export default TextArea
