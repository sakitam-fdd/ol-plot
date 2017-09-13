/**
 * Created by FDD on 2017/5/15.
 * @desc PlotDraw
 */
import mixin from '../Utils/mixin'
import { MathDistance } from '../Utils/utils'
import EventType from '../Event/EventType'
import { POINT, PENNANT } from '../Utils/PlotTypes'
import Observable from 'observable-emit'
import * as Events from 'nature-dom-util/src/events/Events'
import { BASE_LAYERNAME } from '../Constants'
import PlotFactory from './PlotFactory'
import TextArea from '../Geometry/Text/TextArea'
import olLayerLayerUtils from '../Utils/layerUtils'
class PlotDraw extends mixin(PlotFactory, Observable, olLayerLayerUtils) {
  constructor (map, params) {
    super()
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
    this.options = params || {}
    /**
     * 交互点
     * @type {null}
     */
    this.points = null
    /**
     * 当前标绘工具
     * @type {null}
     */
    this.plot = null
    /**
     * 当前要素
     * @type {null}
     */
    this.feature = null
    /**
     * 标绘类型
     * @type {null}
     */
    this.plotType = null
    /**
     * 当前标绘参数
     * @type {null}
     */
    this.plotParams = null
    /**
     * 当前地图视图
     * @type {Element}
     */
    this.mapViewport = this.map.getViewport()
    /**
     * 地图双击交互
     * @type {null}
     */
    this.dblClickZoomInteraction = null

    /**
     * 绘制OverLay
     * @type {null}
     */
    this.drawOverlay = null

    /**
     * 创建图层名称
     * @type {string}
     */
    this.layerName = ((this.options && this.options['layerName']) ? this.options['layerName'] : BASE_LAYERNAME)

    /**
     * 当前矢量图层
     * @type {*}
     */
    this.drawLayer = this.createVectorLayer(this.layerName, {
      create: true
    })
    Observable.call(this)
    olLayerLayerUtils.call(this, this.map)
  }

  /**
   * 激活工具
   * @param type
   * @param params
   */
  active (type, params = {}) {
    this.disActive()
    this.deactiveMapTools()
    this.plotType = type
    this.plotParams = params
    if (type === 'TextArea') {
      let textInter = new TextArea(this.map, this.drawLayer, params)
      textInter.on('TextAreaDrawEnd', event => {
        this.disActive()
      })
    } else {
      this.map.on('click', this.mapFirstClickHandler, this)
    }
  }

  /**
   * 取消激活状态
   */
  disActive () {
    this.removeEventHandlers()
    this.map.removeOverlay(this.drawOverlay)
    this.points = []
    this.plot = null
    this.feature = null
    this.plotType = null
    this.plotParams = null
    this.activateMapTools()
  }

  /**
   * PLOT是否处于激活状态
   * @returns {boolean}
   */
  isDrawing () {
    return !!this.plotType
  }

  /**
   * 地图事件处理
   * 激活工具后第一次点击事件
   * @param event
   */
  mapFirstClickHandler (event) {
    this.map.un('click', this.mapFirstClickHandler, this)
    this.points.push(event.coordinate)
    this.plot = this.createPlot(this.plotType, this.points, this.plotParams)
    this.plot.setMap(this.map)
    this.feature = new ol.Feature(this.plot)
    this.feature.set('isPlot', true)
    this.drawLayer.getSource().addFeature(this.feature)
    if (this.plotType === POINT || this.plotType === PENNANT) {
      this.plot.finishDrawing()
      this.drawEnd(event)
    } else {
      this.map.on('click', this.mapNextClickHandler, this)
      if (!this.plot.freehand) {
        this.map.on('dblclick', this.mapDoubleClickHandler, this)
      }
      Events.listen(this.mapViewport, EventType.MOUSEMOVE, this.mapMouseMoveHandler, this, false)
    }
    if (this.plotType && this.feature) {
      this.plotParams['plotType'] = this.plotType
      this.feature.setProperties(this.plotParams)
    }
  }

  /**
   * 地图点击事件处理
   * @param event
   * @returns {boolean}
   */
  mapNextClickHandler (event) {
    if (!this.plot.freehand) {
      if (MathDistance(event.coordinate, this.points[this.points.length - 1]) < 0.0001) {
        return false
      }
    }
    this.points.push(event.coordinate)
    this.plot.setPoints(this.points)
    if (this.plot.fixPointCount === this.plot.getPointCount()) {
      this.mapDoubleClickHandler(event)
    }
    if (this.plot && this.plot.freehand) {
      this.mapDoubleClickHandler(event)
    }
  }

  /**
   * 地图双击事件处理
   * @param event
   */
  mapDoubleClickHandler (event) {
    event.preventDefault()
    this.plot.finishDrawing()
    this.drawEnd(event)
  }

  /**
   * 地图事件处理
   * 鼠标移动事件
   * @param event
   * @returns {boolean}
   */
  mapMouseMoveHandler (event) {
    let coordinate = this.map.getCoordinateFromPixel([event.offsetX, event.offsetY])
    if (MathDistance(coordinate, this.points[this.points.length - 1]) < 0.0001) {
      return false
    }
    if (!this.plot.freehand) {
      let pnts = this.points.concat([coordinate])
      this.plot.setPoints(pnts)
    } else {
      this.points.push(coordinate)
      this.plot.setPoints(this.points)
    }
  }

  /**
   * 移除事件监听
   */
  removeEventHandlers () {
    this.map.un('click', this.mapFirstClickHandler, this)
    this.map.un('click', this.mapNextClickHandler, this)
    Events.unListen(this.mapViewport, EventType.MOUSEMOVE, this.mapMouseMoveHandler, this)
    this.map.un('dblclick', this.mapDoubleClickHandler, this)
  }

  /**
   * 绘制结束
   */
  drawEnd (event) {
    this.dispatchSync('drawEnd', {
      type: 'drawEnd',
      originalEvent: event,
      feature: this.feature
    })
    if (this.feature && this.options['isClear']) {
      this.drawLayer.getSource().removeFeature(this.feature)
    }
    this.activateMapTools()
    this.removeEventHandlers()
    this.map.removeOverlay(this.drawOverlay)
    this.points = []
    this.plot = null
    this.plotType = null
    this.plotParams = null
    this.feature = null
  }

  /**
   * 添加要素
   */
  addFeature () {
    this.feature = new ol.Feature(this.plot)
    if (this.feature && this.drawLayer) {
      this.drawLayer.getSource().addFeature(this.feature)
    }
  }

  /**
   * 取消激活地图交互工具
   */
  deactiveMapTools () {
    let interactions = this.map.getInteractions().getArray()
    interactions.every(item => {
      if (item instanceof ol.interaction.DoubleClickZoom) {
        this.dblClickZoomInteraction = item
        this.map.removeInteraction(item)
        return false
      } else {
        return true
      }
    })
  }

  /**
   * 激活已取消的地图工具
   * 还原之前状态
   */
  activateMapTools () {
    if (this.dblClickZoomInteraction && this.dblClickZoomInteraction instanceof ol.interaction.DoubleClickZoom) {
      this.map.addInteraction(this.dblClickZoomInteraction)
      this.dblClickZoomInteraction = null
    }
  }
}
export default PlotDraw
