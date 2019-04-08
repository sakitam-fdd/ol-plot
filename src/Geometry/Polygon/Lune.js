/**
 * Created by FDD on 2017/5/24.
 * @desc 弓形
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol'
import { Polygon } from 'ol/geom'
import { LUNE } from '../../Utils/PlotTypes'
import * as Constants from '../../Constants'
import * as PlotUtils from '../../Utils/utils'
class Lune extends Polygon {
  constructor (coordinates, points, params) {
    super([])
    this.type = LUNE
    this.fixPointCount = 3
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
    if (this.getPointCount() < 2) {
      return false
    } else {
      let pnts = this.getPoints()
      if (this.getPointCount() === 2) {
        let mid = PlotUtils.Mid(pnts[0], pnts[1])
        let d = PlotUtils.MathDistance(pnts[0], mid)
        let pnt = PlotUtils.getThirdPoint(pnts[0], mid, Constants.HALF_PI, d)
        pnts.push(pnt)
      }
      let [pnt1, pnt2, pnt3, startAngle, endAngle] = [pnts[0], pnts[1], pnts[2], undefined, undefined]
      let center = PlotUtils.getCircleCenterOfThreePoints(pnt1, pnt2, pnt3)
      let radius = PlotUtils.MathDistance(pnt1, center)
      let angle1 = PlotUtils.getAzimuth(pnt1, center)
      let angle2 = PlotUtils.getAzimuth(pnt2, center)
      if (PlotUtils.isClockWise(pnt1, pnt2, pnt3)) {
        startAngle = angle2
        endAngle = angle1
      } else {
        startAngle = angle1
        endAngle = angle2
      }
      pnts = PlotUtils.getArcPoints(center, radius, startAngle, endAngle)
      pnts.push(pnts[0])
      this.setCoordinates([pnts])
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

export default Lune
