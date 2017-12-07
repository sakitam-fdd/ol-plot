/**
 * Created by FDD on 2017/10/25.
 * @desc 构建demo文本编辑器
 */
import $Map from 'ol/map'
import $DrawInteraction from 'ol/interaction/draw'
import $DragPan from 'ol/interaction/dragpan'
import $Overlay from 'ol/overlay'
import $Style from 'ol/style/style'
import $Icon from 'ol/style/icon'
import $Stroke from 'ol/style/stroke'
import $Fill from 'ol/style/fill'
import {getuuid} from 'nature-dom-util/src/utils/utils'
import * as Events from 'nature-dom-util/src/events/Events'
import Observable from 'observable-emit'
class PlotText extends Observable {
  constructor (map, options = {}) {
    super()
    if (map && map instanceof $Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
    this.options = options

    /**
     * 绘制工具
     * @type {null}
     */
    this.draw = null

    /**
     * 当前文本框中心坐标
     * @type {Array}
     */
    this.center = []

    /**
     * 当前文本唯一标识
     * @type {*}
     * @private
     */
    this._uuid = getuuid()

    /**
     * 原始鼠标样式
     * @type {null}
     * @private
     */
    this.preCursor_ = null

    /**
     * 是否处于拖拽
     * @type {boolean}
     * @private
     */
    this.dragging_ = false

    /**
     * 是否为点击事件
     * @type {boolean}
     * @private
     */
    this.isClick_ = false

    /**
     * 地图拖拽
     * @type {null}
     */
    this.mapDragPan = null

    /**
     * 当前文本overlay实例
     * @type {null}
     */
    this.textOverlay = null

    /**
     * 当前文本框容器
     * @type {null}
     */
    this.content = null

    /**
     * 激活工具
     */
    this.activeInteraction()

    Observable.call(this)
  }

  /**
   * 激活交互工具
   */
  activeInteraction () {
    this.draw = new $DrawInteraction({
      style: new $Style({
        fill: new $Fill({
          color: 'rgba(255, 255, 255, 0.7)'
        }),
        stroke: new $Stroke({
          color: 'rgba(0, 0, 0, 0.15)',
          width: 2
        }),
        image: new $Icon({
          anchor: [1, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          opacity: 0.75,
          src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABgklEQVQ4T41T0W3CQAy1lfwRqR0h/CE5UhkBJmiZADpB0wlKJwA2aDegE5QR+Igl/noj9OPuLydXPuXQEYUKS5FyPvvd87ONRDRFxEdr7c4Y8ws3WFmW90VRvIjIF1ZVtQaANxH59N6v8zwvRaQEgCMATDu88I+Ipm1bk2XZHhEfAOAdFW00Gh2YOQafOeidHoaYEdGHc65GDZhMJuXpdDJ99hqkPmZe9e9iTgCoqmrWNM0hDerq/FGftXbcZxFzAgARrZg5vBaNiGpE3OhZRF6Zedu7DzkRYMrMKlQKYBBRQVVgw8zj3n3IGWSg9ESkds6tiqJQbe4AYJ6WGVkPAqh4+romdP9LbXMqZh/gXIKqm+d5EK9vbduOY7d0AAdL6AYLmqbRAQtGRMc4ONF/wSC2RF/PsuwbABapqLEjKqb3fq4sLtoYh6Lbiydr7TbtuwYDgH5qB9XmPEjdKG+Y+Xmo7ms+Lcs5N0uX6ei9X9y4TGtEXIZlukb7PzbdmNcisv8DtQILak2vZsYAAAAASUVORK5CYII='
        })
      }),
      type: 'Circle',
      geometryFunction: $DrawInteraction.createBox()
    })
    this.map.addInteraction(this.draw)
    this.draw.on('drawend', this.drawEnd, this)
  }

  /**
   * 取消激活
   */
  disActiveInteraction () {
    if (this.draw) {
      this.map.removeInteraction(this.draw)
      this.draw = null
    }
  }

  /**
   * 绘制结束
   * @param event
   */
  drawEnd (event) {
    if (event && event.feature) {
      this.map.removeInteraction(this.draw)
      let extent = event.feature.getGeometry().getExtent()
      this.center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2]
      let topLeft = this.map.getPixelFromCoordinate([extent[0], extent[1]])
      let bottomRight = this.map.getPixelFromCoordinate([extent[2], extent[3]])
      this.creatTextArea({
        center: this.center,
        width: parseInt(Math.abs(topLeft[0] - bottomRight[0])),
        height: parseInt(Math.abs(topLeft[1] - bottomRight[1]))
      })
    } else {
      console.info('未获取到要素！')
    }
  }

  /**
   * 创建元素
   * @param params
   */
  creatTextArea (params) {
    this.content = document.createElement('div')
    this.content.className = this.options.className || 'ol-plot-text-editor'
    this.content.style.width = params['width'] + 'px'
    this.content.style.minHeight = params['height'] + 'px'
    this.content.setAttribute('id', this._uuid)
    this.content.setAttribute('contenteditable', true)
    Events.listen(this.content, 'click', this.handleClick_, this)
    Events.listen(window, 'click', this.handleClick_, this)
    Events.listen(this.content, 'pointerdown', this.handleDraggerStart_, this)
    Events.listen(window, 'pointerup', this.handleDraggerEnd_, this)
    this.textOverlay = new $Overlay({
      id: this._uuid,
      element: this.content,
      position: params['center'],
      positioning: 'center-center',
      stopEvent: false,
      insertFirst: false
    })
    this.map.addOverlay(this.textOverlay)
    this.map.render()
    this.dispatch('TextAreaDrawEnd', {
      source: this,
      overlay: this.textOverlay,
      element: this.content,
      uuid: this._uuid
    })
  }

  /**
   * 处理拖拽开始
   * @param event
   * @private
   */
  handleDraggerStart_ () {
    if (!this.dragging_) {
      window.setTimeout(() => {
        if (!this.isClick_) {
          this.dragging_ = true
          this.disableMapDragPan()
          this.preCursor_ = this.content.style.cursor
          Events.listen(this.content, 'pointermove', this.handleDraggerDrag_, this)
          Events.listen(this.content, 'pointerup', this.handleDraggerEnd_, this)
        }
      }, 300)
    }
  }

  /**
   * 处理拖拽
   * @param event
   * @private
   */
  handleDraggerDrag_ (event) {
    if (this.dragging_) {
      this.content.style.cursor = 'move'
      this.center = this.map.getCoordinateFromPixel([event.clientX, event.clientY])
      this.textOverlay.setPosition(this.center)
    }
  }

  /**
   * 处理拖拽
   * @private
   */
  handleDraggerEnd_ () {
    this.isClick_ = false
    if (this.dragging_) {
      this.dragging_ = false
      this.enableMapDragPan()
      this.content.style.cursor = this.preCursor_
      Events.unListen(this.content, 'pointermove', this.handleDraggerDrag_, this)
      Events.unListen(this.content, 'pointerup', this.handleDraggerEnd_, this)
    }
  }

  /**
   * 处理点击事件
   * @param event
   * @private
   */
  handleClick_ (event) {
    if (event.target === this.content) {
      this.isClick_ = true
    } else {
    }
  }

  /**
   * 设置样式
   * @param style
   */
  setStyle (style = {}) {
    if (this.content) {
      for (let key in style) {
        if (PlotText.Property_.hasOwnProperty(key) && style[key]) {
          this.content.style[key] = style[key]
        }
      }
    }
  }

  /**
   * 获取当前样式
   * @returns {CSSStyleDeclaration}
   */
  getStyle () {
    return this.content.style
  }

  /**
   * 激活地图的拖拽平移
   */
  enableMapDragPan () {
    if (this.mapDragPan && this.mapDragPan instanceof $DragPan) {
      this.map.addInteraction(this.mapDragPan)
      this.mapDragPan = null
    }
  }

  /**
   * 禁止地图的拖拽平移
   */
  disableMapDragPan () {
    let interactions = this.map.getInteractions().getArray()
    interactions.every(item => {
      if (item instanceof $DragPan) {
        this.mapDragPan = item
        this.map.removeInteraction(item)
        return false
      } else {
        return true
      }
    })
  }

  /**
   * 样式支持的静态属性
   * @type {{background: string}}
   * @private
   */
  static Property_ = {
    background: 'background',
    border: 'border',
    borderColor: 'borderColor',
    borderWidth: 'borderWidth',
    borderRadius: 'borderRadius',
    borderStyle: 'borderStyle',
    backgroundColor: 'backgroundColor',
    color: 'color',
    font: 'font',
    fontFamily: 'fontFamily',
    fontSize: 'fontSize',
    fontStyle: 'fontStyle',
    fontVariant: 'fontVariant',
    fontWeight: 'fontWeight'
  }
}

export default PlotText
