/**
 * Created by FDD on 2017/5/26.
 * @desc 分队战斗行动
 * @Inherits AttackArrow
 */

import { PlotTypes } from '@/utils/PlotTypes';
import AttackArrow from './AttackArrow';
import * as PlotUtils from '../../utils/utils';
import * as Constants from '../../constants';

class SquadCombat extends AttackArrow {
  constructor(coordinates, points, params) {
    super(coordinates, points, params);
    this.type = PlotTypes.SQUAD_COMBAT;
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.tailWidthFactor = 0.1;
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
  generate() {
    try {
      const count = this.getPointCount();
      if (count < 2) {
        return false;
        // eslint-disable-next-line no-else-return
      } else {
        const pnts = this.getPoints();
        const tailPnts = this.getTailPoints(pnts);
        const headPnts = this.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[1]);
        if (headPnts && headPnts.length > 4) {
          const neckLeft = headPnts[0];
          const neckRight = headPnts[4];
          const bodyPnts = this.getArrowBodyPoints(pnts, neckLeft, neckRight, this.tailWidthFactor);
          // eslint-disable-next-line @typescript-eslint/no-shadow
          const count = bodyPnts.length;
          let leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, count / 2));
          leftPnts.push(neckLeft);
          let rightPnts = [tailPnts[1]].concat(bodyPnts.slice(count / 2, count));
          rightPnts.push(neckRight);
          leftPnts = PlotUtils.getQBSplinePoints(leftPnts);
          rightPnts = PlotUtils.getQBSplinePoints(rightPnts);
          this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse())]);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  getTailPoints(points) {
    const allLen = PlotUtils.getBaseLength(points);
    const tailWidth = allLen * this.tailWidthFactor;
    const tailLeft = PlotUtils.getThirdPoint(points[1], points[0], Constants.HALF_PI, tailWidth, false);
    const tailRight = PlotUtils.getThirdPoint(points[1], points[0], Constants.HALF_PI, tailWidth, true);
    return [tailLeft, tailRight];
  }
}

export default SquadCombat;
