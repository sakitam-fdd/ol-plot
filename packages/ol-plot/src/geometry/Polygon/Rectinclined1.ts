/**
 * Created by wh on 2023.6.1
 * @desc 斜矩形1
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol';
import { Polygon as $Polygon } from 'ol/geom';
import { PlotTypes } from '@/utils/PlotTypes';
import * as Constants from '@/constants';
import type { Point } from '@/utils/utils';

class Rectinclined extends $Polygon {
  type: PlotTypes;

  fixPointCount: WithUndef<number>;

  map: any;

  points: Point[];

  freehand: boolean;

  constructor(coordinates, points, params) {
    super([]);
    this.type = PlotTypes.RECTINCLINED1;
    this.fixPointCount = 3;
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
    const points = this.getPointCount();
    if (points < 2) {
      return false;
    }
    if (points === 2) {
      this.setCoordinates([this.points]);
      return;
    }

    const pnts = this.getPoints();
    const [pnt1, pnt2, mouse] = [pnts[0], pnts[1], pnts[2]];
    const baseLen = Math.hypot(pnt2[0] - pnt1[0], pnt2[1] - pnt1[1]);
    if (baseLen <= Constants.ZERO_TOLERANCE) {
      this.setCoordinates([[pnt1, pnt2, mouse, pnt1]]);
      return;
    }

    const d = this.calculatePerpendicularDistance(pnt1, pnt2, mouse);
    const direction = this.calculatePositionRelativeToLine(pnt1, pnt2, mouse);
    const pnt3 = this.calculatePerpendicularPoint(pnt1, pnt2, direction * d);
    const pnt4 = this.calculateFourthPoint(pnt1, pnt2, pnt3);
    this.setCoordinates([[pnt1, pnt2, pnt3, pnt4, pnt1]]);
  }

  /**
   * 已知p1，p2，p3三点，计算p3到p1p2的垂直距离
   */
  calculatePerpendicularDistance(p1, p2, p3) {
    const vx = p2[0] - p1[0];
    const vy = p2[1] - p1[1];
    const vMagnitude = Math.sqrt(vx * vx + vy * vy);
    if (vMagnitude <= Constants.ZERO_TOLERANCE) {
      return 0;
    }
    const px = p3[0] - p1[0];
    const py = p3[1] - p1[1];
    return Math.abs(vx * py - vy * px) / vMagnitude;
  }

  /**
   * 已知p1，p2，判断p3在有向线段左右：1 左侧，-1 右侧，0 线上
   */
  calculatePositionRelativeToLine(p1, p2, p3) {
    const crossProduct = (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0]);
    if (Math.abs(crossProduct) <= Constants.ZERO_TOLERANCE) {
      return 0;
    }
    return crossProduct > 0 ? 1 : -1;
  }

  /**
   * 已知p1，p2，p3点求矩形的p4点
   */
  calculateFourthPoint(p1, p2, p3): Point {
    const x = p1[0] + p3[0] - p2[0];
    const y = p1[1] + p3[1] - p2[1];
    return [x, y];
  }

  /**
   * 已知底边与有符号距离 d，求相对 p2 的垂向角点
   */
  calculatePerpendicularPoint(p1, p2, d): Point {
    const vx = p2[0] - p1[0];
    const vy = p2[1] - p1[1];
    const vMagnitude = Math.sqrt(vx * vx + vy * vy);
    if (vMagnitude <= Constants.ZERO_TOLERANCE) {
      return [p2[0], p2[1]];
    }
    // 单位法向（逆时针旋转 90°）
    const nx = -vy / vMagnitude;
    const ny = vx / vMagnitude;
    return [p2[0] + nx * d, p2[1] + ny * d];
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
   * @returns {ol.Map|*}
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

export default Rectinclined;
