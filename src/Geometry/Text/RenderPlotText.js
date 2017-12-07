/**
 * Created by FDD on 2017/9/13.
 * @desc render plot text
 * @base https://github.com/sakitam-fdd/ol-extent
 */
import $Map from 'ol/map'
import $VectorLayer from 'ol/layer/vector'
import $DrawInteraction from 'ol/interaction/draw'
import $Point from 'ol/geom/point'
import $Overlay from 'ol/overlay'
import $Style from 'ol/style/style'
import $Icon from 'ol/style/icon'
import $Stroke from 'ol/style/stroke'
import $Fill from 'ol/style/fill'
import {getuuid} from 'nature-dom-util/src/utils/utils'
import * as Events from 'nature-dom-util/src/events/Events'
import EventType from '../../Event/EventType'
import autosize from 'autosize'
import Observable from 'observable-emit'
import mixin from '../../Utils/mixin'
import { DEF_TEXT_STYEL } from '../../Constants'
$VectorLayer.prototype.setPlotText = function (render) {
  render.setLayer(this)
}

class RenderPlotText {
  constructor (options = {}) {
    /**
     * 最大分辨率
     * @type {*}
     * @private
     */
    this.maxResolution_ = options['maxResolution'] || 100

    /**
     * 默认样式
     * @type {{stroke: {strokeWidth: number, strokeColor: string}, fill: {fillColor: string}}}
     */
    this.baseStyle = {
      stroke: {
        strokeWidth: 1,
        strokeColor: 'rgba(196,189,181,1)'
      },
      fill: {
        fillColor: 'rgba(248,238,228,1)'
      },
      text: {
        stroke: {
          strokeWidth: 1,
          strokeColor: 'rgba(87,87,87,1)'
        },
        fill: {
          fillColor: 'rgba(255,255,255,0.5)'
        },
        textAlign: 'center',
        textBaseline: 'bottom',
        textScale: 1
      }
    }
    if (options['style']) {
      this.eachObject(this.baseStyle, options['style'])
    }
  }
  eachObject (base = {}, params = {}) {
    for (let key in base) {
      if (key && base[key] && params[key]) {
        if (typeof base[key] === 'object') {
          this.eachObject(base[key], params[key])
        } else {
          base[key] = params[key]
        }
      }
    }
  }
  postcompose_ (event) {
    let res = event.frameState.viewState.resolution
    if (res <= this.maxResolution_) {
      this.res_ = res * 400
      if (this.animate_) {
        let elapsed = event.frameState.time - this.animate_
        if (elapsed < this.animateDuration_) {
          this.elapsedRatio_ = this.easing_(elapsed / this.animateDuration_)
          event.frameState.animate = true
        } else {
          this.animate_ = false
          this.height_ = this.toHeight_
        }
      }
      let ratio = event.frameState.pixelRatio
      let ctx = event.context
      let matrix = this.matrix_ = event.frameState.coordinateToPixelTransform
      if (!matrix) {
        matrix = event.frameState.coordinateToPixelMatrix
        matrix[2] = matrix[4]
        matrix[3] = matrix[5]
        matrix[4] = matrix[12]
        matrix[5] = matrix[13]
      }
      this.center_ = [ctx.canvas.width / 2 / ratio, ctx.canvas.height / ratio]
      let features_ = this.layer_.getSource().getFeaturesInExtent(event.frameState.extent)
      ctx.save()
      ctx.scale(ratio, ratio)
      ctx.lineWidth = this.baseStyle.stroke.strokeWidth
      ctx.strokeStyle = this.baseStyle.stroke.strokeColor
      ctx.fillStyle = this.baseStyle.fill.fillColor
      let builds = []
      features_.forEach(feature => {
        builds.push(this.getFeature3D_(feature, this.getFeatureHeight(feature)))
      })
      this.drawFeature3D_(ctx, builds)
      ctx.restore()
    } else {
      // console.warn('超出所设置最大分辨率！')
    }
  }
  setLayer (layer) {
    if (layer) {
      if (this.layer_) {
        this.layer_.un('postcompose', this.postcompose_, this)
      }
      this.layer_ = layer
      this.layer_.on('postcompose', this.postcompose_, this)
    }
  }
  handleVector_ (point, height) {
    let point0 = [
      point[0] * this.matrix_[0] + point[1] * this.matrix_[1] + this.matrix_[4],
      point[0] * this.matrix_[2] + point[1] * this.matrix_[3] + this.matrix_[5]
    ]
    let point1 = [
      point0[0] + height / this.res_ * (point0[0] - this.center_[0]),
      point0[1] + height / this.res_ * (point0[1] - this.center_[1])
    ]
    return [point0, point1]
  }
  getFeature3D_ (feature, height) {
    let coordinates = feature.getGeometry().getCoordinates()
    let json = {
      type: '',
      feature: feature,
      geom: ''
    }
    switch (feature.getGeometry().getType()) {
      case 'Polygon':
        coordinates = [coordinates]
        json.type = 'MultiPolygon'
        json.geom = this.getBuilds_(coordinates, height)
        break
      case 'MultiPolygon':
        json.type = 'MultiPolygon'
        json.geom = this.getBuilds_(coordinates, height)
        break
      case 'Point':
        json.type = 'Point'
        json.geom = this.handleVector_(coordinates, height)
        break
      default:
        json = {}
        break
    }
    return json
  }
  getBuilds_ (coordinates, height) {
    let build = []
    coordinates.forEach(coords => {
      if (coords && Array.isArray(coords) && coords.length > 0) {
        coords.forEach(coord => {
          if (coord && Array.isArray(coord) && coord.length > 0) {
            let bear = []
            coord.forEach(cod => {
              bear.push(this.handleVector_(cod, height))
            })
            build.push(bear)
          }
        })
      }
    })
    return build
  }
  drawFeature3D_ (ctx, buildings) {
    for (let i = 0; i < buildings.length; i++) {
      switch (buildings[i].type) {
        case 'MultiPolygon':
          for (let j = 0; j < buildings[i].geom.length; j++) {
            let b = buildings[i].geom[j]
            for (let k = 0; k < b.length; k++) {
              let geom_ = b[k]
              ctx.beginPath()
              ctx.moveTo(geom_[0][0], geom_[0][1])
              ctx.lineTo(geom_[1][0], geom_[1][1])
              ctx.stroke()
            }
          }
          break
        case 'Point':
          let geom_ = buildings[i].geom
          ctx.beginPath()
          ctx.moveTo(geom_[0][0], geom_[0][1])
          ctx.lineTo(geom_[1][0], geom_[1][1])
          ctx.stroke()
          break
      }
    }
    for (let i = 0; i < buildings.length; i++) {
      switch (buildings[i].type) {
        case 'MultiPolygon': {
          ctx.beginPath()
          for (let j = 0; j < buildings[i].geom.length; j++) {
            let geom_ = buildings[i].geom[j]
            if (j === 0) {
              ctx.moveTo(geom_[0][1][0], geom_[0][1][1])
              for (let k = 1; k < geom_.length; k++) {
                ctx.lineTo(geom_[k][1][0], geom_[k][1][1])
              }
            } else {
              ctx.moveTo(geom_[0][1][0], geom_[0][1][0])
              for (let k = geom_.length - 2; k >= 0; k--) {
                ctx.lineTo(geom_[k][1][0], geom_[k][1][1])
              }
            }
            ctx.closePath()
          }
          ctx.fill('evenodd')
          ctx.stroke()
          break
        }
        case 'Point': {
          let build = buildings[i]
          let [label, point, fill] = [build.feature.get('label'), build.geom[1], ctx.fillStyle]
          ctx.fillStyle = this.baseStyle.text.stroke.strokeColor
          ctx.textAlign = this.baseStyle.text.textAlign
          ctx.textBaseline = this.baseStyle.text.textBaseline
          ctx.fillText(label, point[0], point[1])
          let m = ctx.measureText(label)
          let h = Number(ctx.font.match(/\d+(\.\d+)?/g).join([]))
          ctx.fillStyle = this.baseStyle.text.fill.fillColor
          ctx.fillRect(point[0] - m.width / 2 - 5, point[1] - h - 5, m.width + 10, h + 10)
          ctx.strokeRect(point[0] - m.width / 2 - 5, point[1] - h - 5, m.width + 10, h + 10)
          ctx.fillStyle = fill
        }
      }
    }
  }
}

class TextPlot extends mixin(Observable) {
  constructor (map, layer, params = {}) {
    super()
    if (map && map instanceof $Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
    if (layer && layer instanceof $VectorLayer) {
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
    this.renderPlotText = new RenderPlotText(this.vectorLayer)
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
          color: 'rgba(255, 0, 0, 0.8)',
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
      this.dispatch('TextAreaDrawEnd', event)
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
    let editer = document.createElement('div')
    let [width, height] = [20, 20]
    editer.innerHTML = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg t="1505268162878" class="icon" style="" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2387" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + width + '" height="' + height + '"><defs><style type="text/css"></style></defs><path d="M959.69595 511.965208 792.498974 344.836793 792.498974 459.036741 564.963771 459.036741 564.963771 231.501538 679.162696 231.501538 511.982092 64.303538 344.819908 231.501538 459.019857 231.501538 459.019857 459.036741 231.484653 459.036741 231.484653 344.836793 64.303027 512.034792 231.484653 679.153998 231.484653 564.963259 459.019857 564.963259 459.019857 792.498462 344.819908 792.498462 512.016885 959.695438 679.162696 792.498462 564.963771 792.498462 564.963771 564.963259 792.498974 564.963259 792.498974 679.153998Z" p-id="2388"></path></svg>'
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
    this.textOverlay = new $Overlay({
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
   * 处理对当前要素点击事件
   */
  featureOnFocus () {
    if (this.textOverlay && this.textOverlay instanceof $Overlay) {
      this.map.addOverlay(this.textOverlay)
      this.vectorLayer.getSource().removeFeature(this.feature)
      this.map.render()
    }
  }

  /**
   * 获取空间信息
   * @returns {ol.geom.Point}
   */
  getGeometry () {
    return new $Point(this.center)
  }
}

export default TextPlot
