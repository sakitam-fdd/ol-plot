/**
 * Created by FDD on 2017/5/15.
 * @desc PlotDraw
 */
import mixin from '../Utils/mixin'
import { MathDistance } from '../Utils/utils'
import EventType from '../Event/EventType'
import PlotTypes from '../Utils/PlotTypes'
import Observable from 'observable-emit'
import * as Events from 'nature-dom-util/src/events/Events'
import { BASE_LAYERNAME } from '../Constants'
import PlotFactory from './PlotFactory'
import TextArea from '../Geometry/Text/TextArea'
class PlotDraw extends mixin(PlotFactory, Observable) {
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
  }

  /**
   * 激活工具
   * @param type
   * @param params
   */
  active (type, params) {
    this.disActive()
    this.deactiveMapTools()
    if (type === 'TextArea') {
      let textInter = new TextArea(this.map, this.drawLayer, params)
      console.log(textInter)
    } else {
      this.map.on('click', this.mapFirstClickHandler, this)
      this.plotType = type
      this.plotParams = params || {}
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
          if (layer.get('layerName') === layerName) {
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
   * 取消激活状态
   */
  disActive () {
    this.removeEventHandlers()
    this.map.removeLayer(this.drawOverlay)
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
    return (this.plotType !== null)
  }

  /**
   * 地图事件处理
   * 激活工具后第一次点击事件
   * @param event
   */
  mapFirstClickHandler (event) {
    this.points.push(event.coordinate)
    this.plot = this.createPlot(this.plotType, this.points, this.plotParams)
    this.plot.setMap(this.map)
    this.feature = new ol.Feature(this.plot)
    this.feature.set('isPlot', true)
    this.drawLayer.getSource().addFeature(this.feature)
    this.map.un('click', this.mapFirstClickHandler, this)
    if (this.plotType === PlotTypes.POINT || this.plotType === PlotTypes.PENNANT) {
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
