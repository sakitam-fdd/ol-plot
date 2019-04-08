import { Map, Overlay } from 'ol'
import { DragPan } from 'ol/interaction'

import Feature from 'ol/Feature'

import Observable from 'observable-emit'
import { bindAll } from '../Utils/utils'
import * as htmlUtils from '../Utils/domUtils'
import { BASE_HELP_CONTROL_POINT_ID, BASE_HELP_HIDDEN } from '../Constants'
class PlotEdit extends Observable {
  constructor (map) {
    super()
    if (map && map instanceof Map) {
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

    bindAll([
      'controlPointMouseDownHandler',
      'controlPointMouseMoveHandler2',
      'controlPointMouseUpHandler',
      'controlPointMouseMoveHandler',
      'plotMouseOverOutHandler',
      'plotMouseDownHandler',
      'plotMouseUpHandler',
      'plotMouseMoveHandler'
    ], this)
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
        if (item && item instanceof Overlay) {
          this.map.removeOverlay(item)
        }
        let element = htmlUtils.getElement(BASE_HELP_CONTROL_POINT_ID + '-' + index)
        if (element) {
          htmlUtils.off(element, 'mousedown', this.controlPointMouseDownHandler.bind(this))
          htmlUtils.off(element, 'mousemove', this.controlPointMouseMoveHandler2.bind(this))
        }
      })
      this.controlPoints = []
    }
    let parent = this.getMapParentElement()
    let hiddenDiv = htmlUtils.getElement(BASE_HELP_HIDDEN)
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
        let element = htmlUtils.getElement(id)
        let pnt = new Overlay({
          id: id,
          position: cPnts[index],
          positioning: 'center-center',
          element: element
        })
        this.controlPoints.push(pnt)
        this.map.addOverlay(pnt)
        this.map.render()
        htmlUtils.on(element, 'mousedown', this.controlPointMouseDownHandler)
        htmlUtils.on(element, 'mousemove', this.controlPointMouseMoveHandler2)
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
    this.activeControlPointId = e.target.id
    this.map.on('pointermove', this.controlPointMouseMoveHandler)
    htmlUtils.on(this.mapViewport, 'mouseup', this.controlPointMouseUpHandler)
  }

  /**
   * 对控制点的移动事件
   * @param event
   */
  controlPointMouseMoveHandler (event) {
    let coordinate = event.coordinate
    if (this.activeControlPointId) {
      let plot = this.activePlot.getGeometry()
      let index = this.elementTable[this.activeControlPointId]
      plot.updatePoint(coordinate, index)
      let overlay = this.map.getOverlayById(this.activeControlPointId)
      if (overlay) {
        overlay.setPosition(coordinate)
      }
    }
  }

  /**
   * 对控制点的鼠标抬起事件
   * @param event
   */
  controlPointMouseUpHandler (event) {
    this.map.un('pointermove', this.controlPointMouseMoveHandler)
    htmlUtils.off(this.mapViewport, 'mouseup', this.controlPointMouseUpHandler)
  }

  /**
   * 激活工具
   * @param plot
   * @returns {boolean}
   */
  activate (plot) {
    if (plot &&
      plot instanceof Feature &&
      plot.get('isPlot') &&
      plot.getGeometry().isPlot &&
      plot !== this.activePlot) {
      this.deactivate()
      this.activePlot = plot
      this.previousCursor_ = this.map.getTargetElement().style.cursor
      window.setTimeout(() => {
        this.dispatch('active_plot_change', this.activePlot)
      }, 500)
      this.map.on('pointermove', this.plotMouseOverOutHandler)
      this.initHelperDom()
      this.initControlPoints()
    }
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
    let feature = this.map.forEachFeatureAtPixel(e.pixel, function (feature) {
      return feature
    })
    if (feature && feature === this.activePlot) {
      if (!this.mouseOver) {
        this.mouseOver = true
        this.map.getTargetElement().style.cursor = 'move'
        this.map.on('pointerdown', this.plotMouseDownHandler)
      }
    } else {
      if (this.mouseOver) {
        this.mouseOver = false
        this.map.getTargetElement().style.cursor = 'default'
        this.map.un('pointerdown', this.plotMouseDownHandler)
      }
    }
    return feature
  }

  /**
   * 在要编辑的要素按下鼠标按键
   * @param event
   */
  plotMouseDownHandler (event) {
    this.ghostControlPoints = this.getControlPoints()
    this.startPoint = event.coordinate
    this.disableMapDragPan()
    this.map.on('pointerup', this.plotMouseUpHandler)
    this.map.on('pointerdrag', this.plotMouseMoveHandler)
  }

  /**
   * 在要编辑的要素上移动鼠标
   * @param event
   */
  plotMouseMoveHandler (event) {
    let [deltaX, deltaY, newPoints] = [event.coordinate[0] - this.startPoint[0], event.coordinate[1] - this.startPoint[1], []]
    if (this.ghostControlPoints && Array.isArray(this.ghostControlPoints) && this.ghostControlPoints.length > 0) {
      for (let i = 0; i < this.ghostControlPoints.length; i++) {
        let coordinate = [this.ghostControlPoints[i][0] + deltaX, this.ghostControlPoints[i][1] + deltaY]
        newPoints.push(coordinate)
        let id = BASE_HELP_CONTROL_POINT_ID + '-' + i
        let overlay = this.map.getOverlayById(id)
        if (overlay) {
          overlay.setPosition(coordinate)
          overlay.setPositioning('center-center')
        }
      }
    }
    const _geometry = this.activePlot.getGeometry()
    _geometry.setPoints(newPoints)
  }

  /**
   * 鼠标抬起事件
   * @param event
   */
  plotMouseUpHandler (event) {
    this.enableMapDragPan()
    this.map.un('pointerup', this.plotMouseUpHandler)
    this.map.un('pointerdrag', this.plotMouseMoveHandler)
  }

  /**
   * 取消事件关联
   */
  disconnectEventHandlers () {
    this.map.un('pointermove', this.plotMouseOverOutHandler)
    this.map.un('pointermove', this.controlPointMouseMoveHandler)
    htmlUtils.off(this.mapViewport, 'mouseup', this.controlPointMouseUpHandler)
    this.map.un('pointerdown', this.plotMouseDownHandler)
    this.map.un('pointerup', this.plotMouseUpHandler)
    this.map.un('pointerdrag', this.plotMouseMoveHandler)
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
      if (item instanceof DragPan) {
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
    if (this.mapDragPan && this.mapDragPan instanceof DragPan) {
      this.map.addInteraction(this.mapDragPan)
      this.mapDragPan = null
    }
  }
}
export default PlotEdit
