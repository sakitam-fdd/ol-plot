/**
 * Created by FDD on 2017/5/24.
 * @desc 粗单直箭头
 * @Inherits FineArrow
 */
import FineArrow from './FineArrow'
import PlotTypes from '../../Utils/PlotTypes'
class AssaultDirection extends FineArrow {
  constructor (points, params) {
    super()
    FineArrow.call(this, points, params)
    this.tailWidthFactor = 0.05
    this.neckWidthFactor = 0.1
    this.headWidthFactor = 0.15
    this.type = PlotTypes.ASSAULT_DIRECTION
    this.headAngle = Math.PI / 4
    this.neckAngle = Math.PI * 0.17741
    this.setPoints(points)
    this.set('params', params)
  }
}

export default AssaultDirection
