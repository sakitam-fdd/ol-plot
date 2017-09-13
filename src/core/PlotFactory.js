/**
 * Created by FDD on 2017/5/15.
 * @desc 基于openlayer的动态标绘
 */
import * as Plots from '../Geometry/index'
import * as PlotTypes from '../Utils/PlotTypes'
class PlotFactory {
  constructor (map) {
    this.version = '1.0.0'
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('缺少地图对象！')
    }
  }

  /**
   * 创建Plot
   * @param type
   * @param points
   * @param _params
   * @returns {*}
   */
  createPlot (type, points, _params) {
    let params = _params || {}
    switch (type) {
      case PlotTypes.TextArea:
        return 'TextArea'
      case PlotTypes.POINT:
        return new Plots.Point(points, params)
      case PlotTypes.PENNANT:
        return new Plots.Pennant(points, params)
      case PlotTypes.POLYLINE:
        return new Plots.Polyline(points, params)
      case PlotTypes.ARC:
        return new Plots.Arc(points, params)
      case PlotTypes.CIRCLE:
        return new Plots.Circle(points, params)
      case PlotTypes.CURVE:
        return new Plots.Curve(points, params)
      case PlotTypes.FREE_LINE:
        return new Plots.FreeHandLine(points, params)
      case PlotTypes.RECTANGLE:
        return new Plots.RectAngle(points, params)
      case PlotTypes.ELLIPSE:
        return new Plots.Ellipse(points, params)
      case PlotTypes.LUNE:
        return new Plots.Lune(points, params)
      case PlotTypes.SECTOR:
        return new Plots.Sector(points, params)
      case PlotTypes.CLOSED_CURVE:
        return new Plots.ClosedCurve(points, params)
      case PlotTypes.POLYGON:
        return new Plots.Polygon(points, params)
      case PlotTypes.ATTACK_ARROW:
        return new Plots.AttackArrow(points, params)
      case PlotTypes.FREE_POLYGON:
        return new Plots.FreePolygon(points, params)
      case PlotTypes.DOUBLE_ARROW:
        return new Plots.DoubleArrow(points, params)
      case PlotTypes.STRAIGHT_ARROW:
        return new Plots.StraightArrow(points, params)
      case PlotTypes.FINE_ARROW:
        return new Plots.FineArrow(points, params)
      case PlotTypes.ASSAULT_DIRECTION:
        return new Plots.AssaultDirection(points, params)
      case PlotTypes.TAILED_ATTACK_ARROW:
        return new Plots.TailedAttackArrow(points, params)
      case PlotTypes.SQUAD_COMBAT:
        return new Plots.SquadCombat(points, params)
      case PlotTypes.TAILED_SQUAD_COMBAT:
        return new Plots.TailedSquadCombat(points, params)
      case PlotTypes.GATHERING_PLACE:
        return new Plots.GatheringPlace(points, params)
    }
    return null
  }

  /**
   * 设置地图对象
   * @param map
   */
  setMap (map) {
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
  }

  /**
   * 获取当前地图对象
   * @returns {ol.Map|*}
   */
  getMap () {
    return this.map
  }
}
export default PlotFactory
