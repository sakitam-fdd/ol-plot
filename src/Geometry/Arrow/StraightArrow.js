/**
 * Created by FDD on 2017/5/24.
 * @desc 细直箭头
 */
import { Map } from 'ol'
import { LineString } from 'ol/geom'
import { STRAIGHT_ARROW } from '../../Utils/PlotTypes'
import * as PlotUtils from '../../Utils/utils'
class StraightArrow extends LineString {
  constructor (coordinates, points, params) {
    super([])
    this.type = STRAIGHT_ARROW
    this.fixPointCount = 2
    this.maxArrowLength = 3000000
    this.arrowLengthScale = 5
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
      let count = this.getPointCount()
      if (count < 2) {
        return false
      } else {
        let pnts = this.getPoints()
        let [pnt1, pnt2] = [pnts[0], pnts[1]]
        let distance = PlotUtils.MathDistance(pnt1, pnt2)
        let len = distance / this.arrowLengthScale
        len = ((len > this.maxArrowLength) ? this.maxArrowLength : len)
        let leftPnt = PlotUtils.getThirdPoint(pnt1, pnt2, Math.PI / 6, len, false)
        let rightPnt = PlotUtils.getThirdPoint(pnt1, pnt2, Math.PI / 6, len, true)
        this.setCoordinates([pnt1, pnt2, leftPnt, pnt2, rightPnt])
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
   * @returns {{}|*}
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

export default StraightArrow
