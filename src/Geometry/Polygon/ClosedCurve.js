/**
 * Created by FDD on 2017/5/25.
 * @desc 闭合曲面
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol'
import { Polygon } from 'ol/geom'
import { CLOSED_CURVE } from '../../Utils/PlotTypes'
import * as PlotUtils from '../../Utils/utils'
import * as Constants from '../../Constants'
class ClosedCurve extends Polygon {
  constructor (coordinates, points, params) {
    super([])
    this.type = CLOSED_CURVE
    this.t = 0.3
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
    let points = this.getPointCount()
    if (points < 2) {
      return false
    } else if (points === 2) {
      this.setCoordinates([this.points])
    } else {
      let pnts = this.getPoints()
      pnts.push(pnts[0], pnts[1])
      let [normals, pList] = [[], []]
      for (let i = 0; i < pnts.length - 2; i++) {
        let normalPoints = PlotUtils.getBisectorNormals(this.t, pnts[i], pnts[i + 1], pnts[i + 2])
        normals = normals.concat(normalPoints)
      }
      let count = normals.length
      normals = [normals[count - 1]].concat(normals.slice(0, count - 1))
      for (let i = 0; i < pnts.length - 2; i++) {
        let pnt1 = pnts[i]
        let pnt2 = pnts[i + 1]
        pList.push(pnt1)
        for (let t = 0; t <= Constants.FITTING_COUNT; t++) {
          let pnt = PlotUtils.getCubicValue(t / Constants.FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2)
          pList.push(pnt)
        }
        pList.push(pnt2)
      }
      this.setCoordinates([pList])
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

export default ClosedCurve
