import EventType from '../Event/EventType'
import Observable from 'observable-emit'
import * as htmlUtils from 'nature-dom-util/src/utils/domUtils'
import * as Events from 'nature-dom-util/src/events/Events'
import { BASE_HELP_CONTROL_POINT_ID, BASE_HELP_HIDDEN } from '../Constants'
class PlotEdit extends Observable {
  constructor (map) {
    super()
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
    /**
     * 当前地图容器
     * @type {Element}
     */
    this.mapViewport = this.map.getViewport()
    /**
     * 激活绘制工具
     * @type {null}
     */
    this.activePlot = null
    /**
     * 开始点
     * @type {null}
     */
    this.startPoint = null
    /**
     * clone的控制点
     * @type {null}
     */
    this.ghostControlPoints = null
    /**
     * 控制点
     * @type {null}
     */
    this.controlPoints = null
    /**
     * 鼠标移入
     * @type {boolean}
     */
    this.mouseOver = false
    /**
     * 元素
     * @type {{}}
     */
    this.elementTable = {}
    /**
     * 当前激活的控制点的ID
     * @type {null}
     */
    this.activeControlPointId = null
    /**
     * 地图拖拽交互
     * @type {null}
     */
    this.mapDragPan = null
    /**
     * 未激活之前鼠标样式
     * @type {null}
     * @private
     */
    this.previousCursor_ = null
    Observable.call(this)
  }

  /**
   * 初始化提示DOM
   * @returns {boolean}
   */
  initHelperDom () {
    if (!this.map || !this.activePlot) {
      return false
    }
    let parent = this.getMapParentElement()
    if (!parent) {
      return false
    } else {
      let hiddenDiv = htmlUtils.createHidden('div', parent, BASE_HELP_HIDDEN)
      let cPnts = this.getControlPoints()
      if (cPnts && Array.isArray(cPnts) && cPnts.length > 0) {
        cPnts.forEach((item, index) => {
          let id = BASE_HELP_CONTROL_POINT_ID + '-' + index
          htmlUtils.create('div', BASE_HELP_CONTROL_POINT_ID, hiddenDiv, id)
          this.elementTable[id] = index
        })
      }
    }
  }

  /**
   * 获取地图元素的父元素
   * @returns {*}
   */
  getMapParentElement () {
    let mapElement = this.map.getTargetElement()
    if (!mapElement) {
      return false
    } else {
      return mapElement.parentNode
    }
  }

  /**
   * 销毁帮助提示DOM
   */
  destroyHelperDom () {
    if (this.controlPoints && Array.isArray(this.controlPoints) && this.controlPoints.length > 0) {
      this.controlPoints.forEach((item, index) => {
        if (item && item instanceof ol.Overlay) {
          this.map.removeOverlay(item)
        }
        let element = htmlUtils.get(BASE_HELP_CONTROL_POINT_ID + '-' + index)
        if (element) {
          Events.removeListener(element, 'mousedown', this.controlPointMouseDownHandler, this)
          Events.removeListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this)
        }
      })
      this.controlPoints = []
    }
    let parent = this.getMapParentElement()
    let hiddenDiv = htmlUtils.get(BASE_HELP_HIDDEN)
    if (hiddenDiv && parent) {
      htmlUtils.remove(hiddenDiv, parent)
    }
  }

  /**
   * 初始化要素控制点
   */
  initControlPoints () {
    this.controlPoints = []
    let cPnts = this.getControlPoints()
    if (cPnts && Array.isArray(cPnts) && cPnts.length > 0) {
      cPnts.forEach((item, index) => {
        let id = BASE_HELP_CONTROL_POINT_ID + '-' + index
        this.elementTable[id] = index
        let element = htmlUtils.get(id)
        let pnt = new ol.Overlay({
          id: id,
          position: cPnts[index],
          positioning: 'center-center',
          element: element
        })
        this.controlPoints.push(pnt)
        this.map.addOverlay(pnt)
        this.map.render()
        Events.addListener(element, 'mousedown', this.controlPointMouseDownHandler, this)
        Events.addListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this)
      })
    }
  }

  /**
   * 对控制点的移动事件
   * @param e
   */
  controlPointMouseMoveHandler2 (e) {
    e.stopImmediatePropagation()
  }

  /**
   * 对控制点的鼠标按下事件
   * @param e
   */
  controlPointMouseDownHandler (e) {
    let id = e.target.id
    this.activeControlPointId = id
    Events.listen(this.mapViewport, EventType.MOUSEMOVE, this.controlPointMouseMoveHandler, this, false)
    Events.listen(this.mapViewport, EventType.MOUSEUP, this.controlPointMouseUpHandler, this, false)
  }

  /**
   * 对控制点的移动事件
   * @param e
   */
  controlPointMouseMoveHandler (e) {
    let coordinate = this.map.getCoordinateFromPixel([e.offsetX, e.offsetY])
    if (this.activeControlPointId) {
      let plot = this.activePlot.getGeometry()
      let index = this.elementTable[this.activeControlPointId]
      plot.updatePoint(coordinate, index)
      let overlay = this.map.getOverlayById(this.activeControlPointId)
      overlay.setPosition(coordinate)
    }
  }

  /**
   * 对控制点的鼠标抬起事件
   * @param e
   */
  controlPointMouseUpHandler (e) {
    Events.unListen(this.mapViewport, EventType.MOUSEMOVE, this.controlPointMouseMoveHandler, this)
    Events.unListen(this.mapViewport, EventType.MOUSEUP, this.controlPointMouseUpHandler, this)
  }

  /**
   * 激活工具
   * @param plot
   * @returns {boolean}
   */
  activate (plot) {
    if (plot && plot instanceof ol.Feature && plot.get('isPlot') && plot !== this.activePlot) {
      this.deactivate()
      this.activePlot = plot
      this.previousCursor_ = this.map.getTargetElement().style.cursor
      if (plot.get('_text_area_source_')) {
        let source = plot.get('_text_area_source_')
        source.featureOnFocus()
        this.map.on('pointermove', this.baseTextAreaPointMove_, this)
      } else {
        window.setTimeout(() => {
          this.dispatch('active_plot_change', this.activePlot)
        }, 500)
        this.map.on('pointermove', this.plotMouseOverOutHandler, this)
        this.initHelperDom()
        this.initControlPoints()
      }
    }
  }

  /**
   * 针对文本框的移动事件处理
   * @param event
   * @returns {T|undefined}
   * @private
   */
  baseTextAreaPointMove_ (event) {
    let feature = this.map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
      return feature
    })
    if (feature && feature === this.activePlot) {
      if (!this.mouseOver) {
        this.mouseOver = true
        this.map.getTargetElement().style.cursor = 'move'
        this.map.on('pointerdown', this.baseTextAreaPointerDown_, this)
      }
    } else {
      if (this.mouseOver) {
        this.mouseOver = false
        this.map.getTargetElement().style.cursor = 'default'
        this.map.un('pointerdown', this.baseTextAreaPointerDown_, this)
      }
    }
    return feature
  }

  /**
   * 处理鼠标按下事件
   * @param event
   * @private
   */
  baseTextAreaPointerDown_ (event) {
    this.startPoint = this.activePlot.getGeometry().getCoordinates()
    this.disableMapDragPan()
    this.map.on('pointerup', this.baseTextAreaPointerUp_, this)
    this.map.on('pointerdrag', this.baseTextAreaPointerDrag_, this)
  }

  /**
   * 针对文本框的鼠标抬起事件处理
   * @param event
   * @private
   */
  baseTextAreaPointerUp_ (event) {
    this.enableMapDragPan()
    this.map.un('pointerup', this.baseTextAreaPointerUp_, this)
    this.map.un('pointerdrag', this.baseTextAreaPointerDrag_, this)
  }

  /**
   * 针对文本框的鼠标拖拽事件处理
   * @param event
   * @private
   */
  baseTextAreaPointerDrag_ (event) {
    let deltaX = event.coordinate[0] - this.startPoint[0]
    let deltaY = event.coordinate[1] - this.startPoint[1]
    let geometry = /** @type {ol.geom.SimpleGeometry} */
      (this.activePlot.getGeometry())
    geometry.translate(deltaX, deltaY)
  }

  /**
   * 获取要素的控制点
   * @returns {Array}
   */
  getControlPoints () {
    let points = []
    if (this.activePlot) {
      let geom = this.activePlot.getGeometry()
      if (geom) {
        points = geom.getPoints()
      }
    }
    return points
  }

  /**
   * 鼠标移出要编辑的要素范围
   * @param e
   * @returns {T|undefined}
   */
  plotMouseOverOutHandler (e) {
    try {
      let feature = this.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        return feature
      })
      if (feature && feature === this.activePlot) {
        if (!this.mouseOver) {
          this.mouseOver = true
          this.map.getTargetElement().style.cursor = 'move'
          this.map.on('pointerdown', this.plotMouseDownHandler, this)
        }
      } else {
        if (this.mouseOver) {
          this.mouseOver = false
          this.map.getTargetElement().style.cursor = 'default'
          this.map.un('pointerdown', this.plotMouseDownHandler, this)
        }
      }
      return feature
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 在要编辑的要素按下鼠标按键
   * @param e
   */
  plotMouseDownHandler (e) {
    this.ghostControlPoints = this.getControlPoints()
    this.startPoint = e.coordinate
    this.disableMapDragPan()
    this.map.on('pointerup', this.plotMouseUpHandler, this)
    this.map.on('pointerdrag', this.plotMouseMoveHandler, this)
  }

  /**
   * 在要编辑的要素上移动鼠标
   * @param e
   */
  plotMouseMoveHandler (e) {
    try {
      let point = e.coordinate
      let [dx, dy, newPoints] = [(point[0] - this.startPoint[0]), (point[1] - this.startPoint[1]), []]
      if (this.ghostControlPoints && Array.isArray(this.ghostControlPoints) && this.ghostControlPoints.length > 0) {
        this.ghostControlPoints.forEach((item, index) => {
          let p = this.ghostControlPoints[index]
          let coordinate = [p[0] + dx, p[1] + dy]
          newPoints.push(coordinate)
          let id = BASE_HELP_CONTROL_POINT_ID + '-' + index
          let overlay = this.map.getOverlayById(id)
          overlay.setPosition(coordinate)
          overlay.setPositioning('center-center')
        })
      }
      let plot = this.activePlot.getGeometry()
      plot.setPoints(newPoints)
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 鼠标抬起事件
   * @param e
   */
  plotMouseUpHandler (e) {
    this.enableMapDragPan()
    this.map.un('pointerup', this.plotMouseUpHandler, this)
    this.map.un('pointerdrag', this.plotMouseMoveHandler, this)
  }

  /**
   * 取消事件关联
   */
  disconnectEventHandlers () {
    this.map.un('pointermove', this.plotMouseOverOutHandler, this)
    Events.unListen(this.mapViewport, EventType.MOUSEMOVE, this.controlPointMouseMoveHandler, this)
    Events.unListen(this.mapViewport, EventType.MOUSEUP, this.controlPointMouseUpHandler, this)
    this.map.un('pointerdown', this.plotMouseDownHandler, this)
    this.map.un('pointerup', this.plotMouseUpHandler, this)
    this.map.un('pointerdrag', this.plotMouseMoveHandler, this)
  }

  /**
   * 取消激活工具
   */
  deactivate () {
    this.activePlot = null
    this.mouseOver = false
    this.map.getTargetElement().style.cursor = this.previousCursor_
    this.previousCursor_ = null
    this.destroyHelperDom()
    this.disconnectEventHandlers()
    this.enableMapDragPan()
    this.elementTable = {}
    this.activeControlPointId = null
    this.startPoint = null
  }

  /**
   * 禁止地图的拖拽平移
   */
  disableMapDragPan () {
    let interactions = this.map.getInteractions().getArray()
    interactions.every(item => {
      if (item instanceof ol.interaction.DragPan) {
        this.mapDragPan = item
        this.map.removeInteraction(item)
        return false
      } else {
        return true
      }
    })
  }

  /**
   * 激活地图的拖拽平移
   */
  enableMapDragPan () {
    if (this.mapDragPan && this.mapDragPan instanceof ol.interaction.DragPan) {
      this.map.addInteraction(this.mapDragPan)
      this.mapDragPan = null
    }
  }
}
export default PlotEdit
