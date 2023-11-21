/**
 * Created by FDD on 2017/5/24.
 * @desc 粗单尖头箭头
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol';
import { Polygon } from 'ol/geom';
import { PlotTypes } from '@/utils/PlotTypes';
import * as PlotUtils from '@/utils/utils';
import * as Constants from '@/constants';
import type { Point } from '@/utils/utils';

class FineArrow extends Polygon {
  type: PlotTypes;

  fixPointCount: WithUndef<number>;

  map: any;

  points: Point[];

  freehand: boolean;

  neckAngle: number;

  headAngle: number;

  headWidthFactor: number;

  neckWidthFactor: number;

  tailWidthFactor: number;

  constructor(coordinates, points, params) {
    super([]);
    this.type = PlotTypes.FINE_ARROW;
    this.tailWidthFactor = 0.1;
    this.neckWidthFactor = 0.2;
    this.headWidthFactor = 0.25;
    this.headAngle = Math.PI / 8.5;
    this.neckAngle = Math.PI / 13;
    this.fixPointCount = 2;
    this.set('params', params);
    if (points && points.length > 0) {
      this.setPoints(points);
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates);
    }
  }

  /**
   * 获取标绘类型
   * @returns {*}
   */
  getPlotType() {
    return this.type;
  }

  /**
   * 执行动作
   */
  generate() {
    try {
      const cont = this.getPointCount();
      if (cont < 2) {
        return false;
      }
      const pnts = this.getPoints();
      const [pnt1, pnt2] = [pnts[0], pnts[1]];
      const len = PlotUtils.getBaseLength(pnts);
      const tailWidth = len * this.tailWidthFactor;
      const neckWidth = len * this.neckWidthFactor;
      const headWidth = len * this.headWidthFactor;
      const tailLeft = PlotUtils.getThirdPoint(pnt2, pnt1, Constants.HALF_PI, tailWidth, true);
      const tailRight = PlotUtils.getThirdPoint(pnt2, pnt1, Constants.HALF_PI, tailWidth, false);
      const headLeft = PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, false);
      const headRight = PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, true);
      const neckLeft = PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, false);
      const neckRight = PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, true);
      const pList = [tailLeft, neckLeft, headLeft, pnt2, headRight, neckRight, tailRight];
      this.setCoordinates([pList]);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * 设置地图对象
   * @param map
   */
  setMap(map) {
    if (map && map instanceof Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  }

  /**
   * 获取当前地图对象
   * @returns {Map|*}
   */
  getMap() {
    return this.map;
  }

  /**
   * 判断是否是Plot
   * @returns {boolean}
   */
  isPlot() {
    return true;
  }

  /**
   * 设置坐标点
   * @param value
   */
  setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  }

  /**
   * 获取坐标点
   * @returns {Array.<T>}
   */
  getPoints() {
    return this.points.slice(0);
  }

  /**
   * 获取点数量
   * @returns {Number}
   */
  getPointCount() {
    return this.points.length;
  }

  /**
   * 更新当前坐标
   * @param point
   * @param index
   */
  updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  }

  /**
   * 更新最后一个坐标
   * @param point
   */
  updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  }

  /**
   * 结束绘制
   */
  finishDrawing() {}
}

export default FineArrow;
