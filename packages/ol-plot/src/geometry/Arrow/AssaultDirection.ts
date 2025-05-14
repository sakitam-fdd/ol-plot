/**
 * Created by FDD on 2017/5/24.
 * @desc 粗单直箭头
 * @Inherits FineArrow
 */
import { PlotTypes } from '@/utils/PlotTypes';
import FineArrow from './FineArrow';

class AssaultDirection extends FineArrow {
  constructor(coordinates, points, params) {
    super(coordinates, points, params);
    this.tailWidthFactor = 0.2;
    this.neckWidthFactor = 0.25;
    this.headWidthFactor = 0.3;
    this.type = PlotTypes.ASSAULT_DIRECTION;
    this.headAngle = Math.PI / 4;
    this.neckAngle = Math.PI * 0.17741;
    if (points && points.length > 0) {
      this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates);
    }
    this.set('params', params);
  }
}

export default AssaultDirection;
