/**
 * Created by FDD on 2017/5/24.
 * @desc 规则矩形
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol'
import { Polygon as $Polygon } from 'ol/geom'
import { fromExtent } from 'ol/geom/Polygon'
import { boundingExtent } from 'ol/extent.js'
import { RECTANGLE } from '../../Utils/PlotTypes'
class RectAngle extends $Polygon {
  constructor (coordinates, points, params) {
    super([])
    this.type = RECTANGLE
    this.fixPointCount = 2
    this.set('params', params)
    this.isFill = ((params['isFill'] === false) ? params['isFill'] : true)
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
    if (this.points.length === 2) {
      let coordinates = []
      if (this.isFill) {
        let extent = boundingExtent(this.points)
        let polygon = fromExtent(extent)
        coordinates = polygon.getCoordinates()
      } else {
        let start = this.points[0]
        let end = this.points[1]
        coordinates = [start, [start[0], end[1]], end, [end[0], start[1]], start]
      }
      this.setCoordinates(coordinates)
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

export default RectAngle
