/**
 * Created by FDD on 2017/5/24.
 * @desc 进攻方向
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol'
import { Polygon } from 'ol/geom'
import { ATTACK_ARROW } from '../../Utils/PlotTypes'
import * as PlotUtils from '../../Utils/utils'
import * as Constants from '../../Constants'
class AttackArrow extends Polygon {
  constructor (coordinates, points, params) {
    super([])
    this.type = ATTACK_ARROW
    this.headHeightFactor = 0.18
    this.headWidthFactor = 0.3
    this.neckHeightFactor = 0.85
    this.neckWidthFactor = 0.15
    this.headTailFactor = 0.8
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
      let points = this.getPointCount()
      if (points < 2) {
        return false
      } else if (points === 2) {
        this.setCoordinates([this.points])
      } else {
        let pnts = this.getPoints()
        let [tailLeft, tailRight] = [pnts[0], pnts[1]]
        if (PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])) {
          tailLeft = pnts[1]
          tailRight = pnts[0]
        }
        let midTail = PlotUtils.Mid(tailLeft, tailRight)
        let bonePnts = [midTail].concat(pnts.slice(2))
        let headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight)
        let [neckLeft, neckRight] = [headPnts[0], headPnts[4]]
        let tailWidthFactor = PlotUtils.MathDistance(tailLeft, tailRight) / PlotUtils.getBaseLength(bonePnts)
        let bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, tailWidthFactor)
        let count = bodyPnts.length
        let leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2))
        leftPnts.push(neckLeft)
        let rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count))
        rightPnts.push(neckRight)
        leftPnts = PlotUtils.getQBSplinePoints(leftPnts)
        rightPnts = PlotUtils.getQBSplinePoints(rightPnts)
        this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse())])
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 插值箭形上的点
   * @param pnt1
   * @param pnt2
   * @param pnt3
   * @param clockWise
   * @returns {Array.<T>}
   */
  getArrowPoints (pnt1, pnt2, pnt3, clockWise) {
    let midPnt = PlotUtils.Mid(pnt1, pnt2)
    let len = PlotUtils.MathDistance(midPnt, pnt3)
    let midPnt1 = PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.3, true)
    let midPnt2 = PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.5, true)
    midPnt1 = PlotUtils.getThirdPoint(midPnt, midPnt1, Constants.HALF_PI, len / 5, clockWise)
    midPnt2 = PlotUtils.getThirdPoint(midPnt, midPnt2, Constants.HALF_PI, len / 4, clockWise)
    let points = [midPnt, midPnt1, midPnt2, pnt3]
    let arrowPnts = this.getArrowHeadPoints(points)
    if (arrowPnts && Array.isArray(arrowPnts) && arrowPnts.length > 0) {
      let [neckLeftPoint, neckRightPoint] = [arrowPnts[0], arrowPnts[4]]
      let tailWidthFactor = PlotUtils.MathDistance(pnt1, pnt2) / PlotUtils.getBaseLength(points) / 2
      let bodyPnts = this.getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor)
      if (bodyPnts) {
        let n = bodyPnts.length
        let lPoints = bodyPnts.slice(0, n / 2)
        let rPoints = bodyPnts.slice(n / 2, n)
        lPoints.push(neckLeftPoint)
        rPoints.push(neckRightPoint)
        lPoints = lPoints.reverse()
        lPoints.push(pnt2)
        rPoints = rPoints.reverse()
        rPoints.push(pnt1)
        return (lPoints.reverse().concat(arrowPnts, rPoints))
      }
    } else {
      throw new Error('插值出错')
    }
  }

  /**
   * 插值头部点
   * @param points
   * @returns {[*,*,*,*,*]}
   */
  getArrowHeadPoints (points, tailLeft, tailRight) {
    try {
      let len = PlotUtils.getBaseLength(points)
      let headHeight = len * this.headHeightFactor
      let headPnt = points[points.length - 1]
      len = PlotUtils.MathDistance(headPnt, points[points.length - 2])
      let tailWidth = PlotUtils.MathDistance(tailLeft, tailRight)
      if (headHeight > tailWidth * this.headTailFactor) {
        headHeight = tailWidth * this.headTailFactor
      }
      let headWidth = headHeight * this.headWidthFactor
      let neckWidth = headHeight * this.neckWidthFactor
      headHeight = headHeight > len ? len : headHeight
      let neckHeight = headHeight * this.neckHeightFactor
      let headEndPnt = PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true)
      let neckEndPnt = PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true)
      let headLeft = PlotUtils.getThirdPoint(headPnt, headEndPnt, Constants.HALF_PI, headWidth, false)
      let headRight = PlotUtils.getThirdPoint(headPnt, headEndPnt, Constants.HALF_PI, headWidth, true)
      let neckLeft = PlotUtils.getThirdPoint(headPnt, neckEndPnt, Constants.HALF_PI, neckWidth, false)
      let neckRight = PlotUtils.getThirdPoint(headPnt, neckEndPnt, Constants.HALF_PI, neckWidth, true)
      return [neckLeft, headLeft, headPnt, headRight, neckRight]
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 插值面部分数据
   * @param points
   * @param neckLeft
   * @param neckRight
   * @param tailWidthFactor
   * @returns {Array.<*>}
   */
  getArrowBodyPoints (points, neckLeft, neckRight, tailWidthFactor) {
    let allLen = PlotUtils.wholeDistance(points)
    let len = PlotUtils.getBaseLength(points)
    let tailWidth = len * tailWidthFactor
    let neckWidth = PlotUtils.MathDistance(neckLeft, neckRight)
    let widthDif = (tailWidth - neckWidth) / 2
    let [tempLen, leftBodyPnts, rightBodyPnts] = [0, [], []]
    for (let i = 1; i < points.length - 1; i++) {
      let angle = PlotUtils.getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2
      tempLen += PlotUtils.MathDistance(points[i - 1], points[i])
      let w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle)
      let left = PlotUtils.getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true)
      let right = PlotUtils.getThirdPoint(points[i - 1], points[i], angle, w, false)
      leftBodyPnts.push(left)
      rightBodyPnts.push(right)
    }
    return leftBodyPnts.concat(rightBodyPnts)
  }

  /**
   * 获取对称点
   * @param linePnt1
   * @param linePnt2
   * @param point
   * @returns {*}
   */
  getTempPoint4 (linePnt1, linePnt2, point) {
    try {
      let midPnt = PlotUtils.Mid(linePnt1, linePnt2)
      let len = PlotUtils.MathDistance(midPnt, point)
      let angle = PlotUtils.getAngleOfThreePoints(linePnt1, midPnt, point)
      let [symPnt, distance1, distance2, mid] = [undefined, undefined, undefined, undefined]
      if (angle < Constants.HALF_PI) {
        distance1 = len * Math.sin(angle)
        distance2 = len * Math.cos(angle)
        mid = PlotUtils.getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, false)
        symPnt = PlotUtils.getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, true)
      } else if (angle >= Constants.HALF_PI && angle < Math.PI) {
        distance1 = len * Math.sin(Math.PI - angle)
        distance2 = len * Math.cos(Math.PI - angle)
        mid = PlotUtils.getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, false)
        symPnt = PlotUtils.getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, false)
      } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
        distance1 = len * Math.sin(angle - Math.PI)
        distance2 = len * Math.cos(angle - Math.PI)
        mid = PlotUtils.getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, true)
        symPnt = PlotUtils.getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, true)
      } else {
        distance1 = len * Math.sin(Math.PI * 2 - angle)
        distance2 = len * Math.cos(Math.PI * 2 - angle)
        mid = PlotUtils.getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, true)
        symPnt = PlotUtils.getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, false)
      }
      return symPnt
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
   * @returns {ol.Map|*}
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

export default AttackArrow
