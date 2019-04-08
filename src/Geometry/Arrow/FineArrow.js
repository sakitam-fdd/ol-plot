/**
 * Created by FDD on 2017/5/24.
 * @desc 粗单尖头箭头
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol'
import { Polygon } from 'ol/geom'
import { FINE_ARROW } from '../../Utils/PlotTypes'
import * as PlotUtils from '../../Utils/utils'
import * as Constants from '../../Constants'
class FineArrow extends Polygon {
  constructor (coordinates, points, params) {
    super([])
    this.type = FINE_ARROW
    this.tailWidthFactor = 0.1
    this.neckWidthFactor = 0.2
    this.headWidthFactor = 0.25
    this.headAngle = Math.PI / 8.5
    this.neckAngle = Math.PI / 13
    this.fixPointCount = 2
    this.set('params', params)
    if (points && points.length > 0) {
      this.setPoints(points)
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates)
    }
  }

  /**
   * 获取标绘类型
   * @returns {*}
   */
  getPlotType () {
    return this.type
  }

  /**
   * 执行动作
   */
  generate () {
    try {
      let cont = this.getPointCount()
      if (cont < 2) {
        return false
      } else {
        let pnts = this.getPoints()
        let [pnt1, pnt2] = [pnts[0], pnts[1]]
        let len = PlotUtils.getBaseLength(pnts)
        let tailWidth = len * this.tailWidthFactor
        let neckWidth = len * this.neckWidthFactor
        let headWidth = len * this.headWidthFactor
        let tailLeft = PlotUtils.getThirdPoint(pnt2, pnt1, Constants.HALF_PI, tailWidth, true)
        let tailRight = PlotUtils.getThirdPoint(pnt2, pnt1, Constants.HALF_PI, tailWidth, false)
        let headLeft = PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, false)
        let headRight = PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, true)
        let neckLeft = PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, false)
        let neckRight = PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, true)
        let pList = [tailLeft, neckLeft, headLeft, pnt2, headRight, neckRight, tailRight]
        this.setCoordinates([pList])
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 设置地图对象
   * @param map
   */
  setMap (map) {
    if (map && map instanceof Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
  }

  /**
   * 获取当前地图对象
   * @returns {Map|*}
   */
  getMap () {
    return this.map
  }

  /**
   * 判断是否是Plot
   * @returns {boolean}
   */
  isPlot () {
    return true
  }

  /**
   * 设置坐标点
   * @param value
   */
  setPoints (value) {
    this.points = !value ? [] : value
    if (this.points.length >= 1) {
      this.generate()
    }
  }

  /**
   * 获取坐标点
   * @returns {Array.<T>}
   */
  getPoints () {
    return this.points.slice(0)
  }

  /**
   * 获取点数量
   * @returns {Number}
   */
  getPointCount () {
    return this.points.length
  }

  /**
   * 更新当前坐标
   * @param point
   * @param index
   */
  updatePoint (point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point
      this.generate()
    }
  }

  /**
   * 更新最后一个坐标
   * @param point
   */
  updateLastPoint (point) {
    this.updatePoint(point, this.points.length - 1)
  }

  /**
   * 结束绘制
   */
  finishDrawing () {
  }
}

export default FineArrow
