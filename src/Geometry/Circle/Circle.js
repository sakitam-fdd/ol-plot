/**
 * Created by FDD on 2017/5/22.
 * @desc 标绘画圆算法，继承面要素相关方法和属性
 */
import { Map } from 'ol'
import { Polygon } from 'ol/geom'
import { CIRCLE } from '../../Utils/PlotTypes'
import * as PlotUtils from '../../Utils/utils'
class Circle extends Polygon {
  constructor (coordinates, points, params) {
    super([])
    this.type = CIRCLE
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

  generate () {
    let count = this.getPointCount()
    if (count < 2) {
      return false
    } else {
      let center = this.points[0]
      let radius = PlotUtils.MathDistance(center, this.points[1])
      this.setCoordinates([this.generatePoints(center, radius)])
    }
  }

  /**
   * 对圆边线进行插值
   * @param center
   * @param radius
   * @returns {null}
   */
  generatePoints (center, radius) {
    let [x, y, angle, points] = [null, null, null, []]
    for (let i = 0; i <= 100; i++) {
      angle = Math.PI * 2 * i / 100
      x = center[0] + radius * Math.cos(angle)
      y = center[1] + radius * Math.sin(angle)
      points.push([x, y])
    }
    return points
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

export default Circle
