/**
 * Created by FDD on 2017/5/26.
 * @desc 进攻方向（尾）
 * @Inherits AttackArrow
 */

import PlotTypes from '../../Utils/PlotTypes'
import AttackArrow from './AttackArrow'
import * as PlotUtils from '../../Utils/utils'
class TailedAttackArrow extends AttackArrow {
  constructor (points, params) {
    super()
    AttackArrow.call(this, points, params)
    this.type = PlotTypes.TAILED_ATTACK_ARROW
    this.headHeightFactor = 0.18
    this.headWidthFactor = 0.3
    this.neckHeightFactor = 0.85
    this.neckWidthFactor = 0.15
    this.tailWidthFactor = 0.1
    this.headTailFactor = 0.8
    this.swallowTailFactor = 1
    this.swallowTailPnt = null
    this.set('params', params)
    this.setPoints(points)
  }

  /**
   * 执行动作
   */
  generate () {
    try {
      let points = this.getPointCount()
      if (points === 2) {
        this.setCoordinates([this.points])
        return false
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
        let tailWidth = PlotUtils.MathDistance(tailLeft, tailRight)
        let allLen = PlotUtils.getBaseLength(bonePnts)
        let len = allLen * this.tailWidthFactor * this.swallowTailFactor
        this.swallowTailPnt = PlotUtils.getThirdPoint(bonePnts[1], bonePnts[0], 0, len, true)
        let factor = tailWidth / allLen
        let bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, factor)
        let count = bodyPnts.length
        let leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2))
        leftPnts.push(neckLeft)
        let rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count))
        rightPnts.push(neckRight)
        leftPnts = PlotUtils.getQBSplinePoints(leftPnts)
        rightPnts = PlotUtils.getQBSplinePoints(rightPnts)
        this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse(), [this.swallowTailPnt, leftPnts[0]])])
      }
    } catch (e) {
      console.log(e)
    }
  }
}

export default TailedAttackArrow
