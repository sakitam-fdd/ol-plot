/**
 * Created by FDD on 2017/9/13.
 * @desc 曲线旗标
 */
import { Map } from 'ol'
import { Polygon } from 'ol/geom'
import { CURVEFLAG } from '../../Utils/PlotTypes'
import { getBezierPoints } from '../../Utils/utils'
class CurveFlag extends Polygon {
  constructor (coordinates, points, params) {
    super([])
    this.type = CURVEFLAG
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
    let count = this.getPointCount()
    if (count < 2) {
      return false
    } else {
      this.setCoordinates([this.calculatePonits(this.points)])
    }
  }

  /**
   * 插值点数据
   * @param points
   * @returns {Array}
   */
  calculatePonits (points) {
    let components = []
    // 至少需要两个控制点
    if (points.length > 1) {
      // 取第一个
      let startPoint = points[0]
      // 取最后一个
      let endPoint = points[points.length - 1]
      // 上曲线起始点
      let point1 = startPoint
      // 上曲线第一控制点
      let point2 = [(endPoint[0] - startPoint[0]) / 4 + startPoint[0], (endPoint[1] - startPoint[1]) / 8 + startPoint[1]]
      // 上曲线第二个点
      let point3 = [(startPoint[0] + endPoint[0]) / 2, startPoint[1]]
      // 上曲线第二控制点
      let point4 = [(endPoint[0] - startPoint[0]) * 3 / 4 + startPoint[0], -(endPoint[1] - startPoint[1]) / 8 + startPoint[1]]
      // 上曲线结束点
      let point5 = [endPoint[0], startPoint[1]]
      // 下曲线结束点
      let point6 = [endPoint[0], (startPoint[1] + endPoint[1]) / 2]
      // 下曲线第二控制点
      let point7 = [(endPoint[0] - startPoint[0]) * 3 / 4 + startPoint[0], (endPoint[1] - startPoint[1]) * 3 / 8 + startPoint[1]]
      // 下曲线第二个点
      let point8 = [(startPoint[0] + endPoint[0]) / 2, (startPoint[1] + endPoint[1]) / 2]
      // 下曲线第一控制点
      let point9 = [(endPoint[0] - startPoint[0]) / 4 + startPoint[0], (endPoint[1] - startPoint[1]) * 5 / 8 + startPoint[1]]
      // 下曲线起始点
      let point10 = [startPoint[0], (startPoint[1] + endPoint[1]) / 2]
      // 旗杆底部点
      let point11 = [startPoint[0], endPoint[1]]
      // 计算上曲线
      let curve1 = getBezierPoints([point1, point2, point3, point4, point5])
      // 计算下曲线
      let curve2 = getBezierPoints([point6, point7, point8, point9, point10])
      // 合并
      components = curve1.concat(curve2)
      components.push(point11)
    }
    return components
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

export default CurveFlag
