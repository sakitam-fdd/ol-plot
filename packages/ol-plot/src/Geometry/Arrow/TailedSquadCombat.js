/**
 * Created by FDD on 2017/5/26.
 * @desc 分队战斗行动（尾）
 * @Inherits AttackArrow
 */

import { TAILED_SQUAD_COMBAT } from '../../utils/PlotTypes';
import AttackArrow from './AttackArrow';
import * as PlotUtils from '../../utils/utils';
import * as Constants from '../../constants';
class TailedSquadCombat extends AttackArrow {
  constructor (coordinates, points, params) {
    super(coordinates, points, params);
    this.type = TAILED_SQUAD_COMBAT;
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.tailWidthFactor = 0.1;
    this.swallowTailFactor = 1;
    this.swallowTailPnt = null;
    this.fixPointCount = 2;
    this.set('params', params);
    if (points && points.length > 0) {
      this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates);
    }
  }

  /**
   * 执行动作
   */
  generate () {
    try {
      let count = this.getPointCount();
      if (count < 2) {
        return false;
      } else {
        let pnts = this.getPoints();
        let tailPnts = this.getTailPoints(pnts);
        let headPnts = this.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[2]);
        let neckLeft = headPnts[0];
        let neckRight = headPnts[4];
        let bodyPnts = this.getArrowBodyPoints(pnts, neckLeft, neckRight, this.tailWidthFactor);
        let count = bodyPnts.length;
        let leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        let rightPnts = [tailPnts[2]].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);
        leftPnts = PlotUtils.getQBSplinePoints(leftPnts);
        rightPnts = PlotUtils.getQBSplinePoints(rightPnts);
        this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse(), [tailPnts[1], leftPnts[0]])]);
      }
    } catch (e) {
      console.log(e);
    }
  }

  getTailPoints (points) {
    let allLen = PlotUtils.getBaseLength(points);
    let tailWidth = allLen * this.tailWidthFactor;
    let tailLeft = PlotUtils.getThirdPoint(points[1], points[0], Constants.HALF_PI, tailWidth, false);
    let tailRight = PlotUtils.getThirdPoint(points[1], points[0], Constants.HALF_PI, tailWidth, true);
    let len = tailWidth * this.swallowTailFactor;
    let swallowTailPnt = PlotUtils.getThirdPoint(points[1], points[0], 0, len, true);
    return ([tailLeft, swallowTailPnt, tailRight]);
  }
}

export default TailedSquadCombat;
