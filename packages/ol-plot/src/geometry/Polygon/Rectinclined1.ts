/**
 * Created by wh on 2023.6.1
 * @desc 斜矩形1
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol';
import { Polygon as $Polygon } from 'ol/geom';
import { PlotTypes } from '@/utils/PlotTypes';
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
    } else {
      const pnts = this.getPoints();
      const [pnt1, pnt2, mouse] = [pnts[0], pnts[1], pnts[2]];
      const d = this.calculatePerpendicularDistance(pnt1, pnt2, mouse);
      const direction = this.calculatePositionRelativeToLine(pnt1, pnt2, mouse);
      const pnt3 = this.calculatePerpendicularPoint(pnt1, pnt2, direction * d);
      const pnt4 = this.calculateFourthPoint(pnt1, pnt2, pnt3);
      const pList: Point[] = [];
      pList.push(pnt1, pnt2, pnt3, pnt4, pnt1);
      this.setCoordinates([pList]);
    }
  }

  /**
   * 已知p1，p2，p3三点，计算p3到p1p2的垂直距离
   * @param {*} p1
   * @param {*} p2
   * @param {*} p3
   */
  calculatePerpendicularDistance(p1, p2, p3) {
    // 计算向量V的分量
    const vx = p2[0] - p1[0];
    const vy = p2[1] - p1[1];
    // 计算P1P3的分量
    const px = p3[0] - p1[0];
    const py = p3[1] - p1[1];
    // 计算向量V的模长
    const vMagnitude = Math.sqrt(vx * vx + vy * vy);
    // 计算点积
    const dotProduct = px * vx + py * vy;
    // 计算投影长度
    const projectionLength = dotProduct / vMagnitude;
    // 计算P1P3的模长
    const pMagnitude = Math.sqrt(px * px + py * py);
    // 计算垂直距离
    const perpendicularDistance = Math.sqrt(pMagnitude * pMagnitude - projectionLength * projectionLength);
    return perpendicularDistance;
  }

  /**
   * 已知p1，p2，两点，判断p3点在p1p2的左右，返回-1右侧，0线上，1左侧
   * @param {*} p1
   * @param {*} p2
   * @param {*} p3
   */
  calculatePositionRelativeToLine(p1, p2, p3) {
    const v1 = {
      x: p2[0] - p1[0],
      y: p2[1] - p1[1],
    };
    const v2 = {
      x: p3[0] - p1[0],
      y: p3[1] - p1[1],
    };
    const crossProduct = v1.x * v2.y - v1.y * v2.x;
    const direction = crossProduct > 0 ? 1 : -1;
    if (p1[1] > p2[1]) {
      return direction;
    }
    return -direction;
  }

  /**
   * 已知p1，p2，p3点求矩形的p4点
   * @param {*} p1
   * @param {*} p2
   * @param {*} p3
   */
  calculateFourthPoint(p1, p2, p3): Point {
    const x = p1[0] + p3[0] - p2[0];
    const y = p1[1] + p3[1] - p2[1];
    return [x, y];
  }

  /**
   * 已知p1，p2两点和距离d，求距离p1p2垂直距离为d的点p3
   * @param {*} p1
   * @param {*} p2
   * @param {*} d
   */
  calculatePerpendicularPoint(p1, p2, d): Point {
    // 计算p1p2的斜率
    const m = (p2[1] - p1[1]) / (p2[0] - p1[0]);

    let x, y;
    // 计算垂线的斜率
    if (m !== 0) {
      const perpendicularSlope = -1 / m;
      // 根据垂线斜率和已知点p2的坐标，得到垂线方程中的常数项
      const c = p2[1] - perpendicularSlope * p2[0];
      // 解垂线方程，求解x和y的值
      x = d * Math.sqrt(1 / (1 + perpendicularSlope ** 2)) + p2[0];
      y = perpendicularSlope * x + c;
    } else {
      x = p2[0];
      y = p2[1] - d;
    }
    // 返回垂线另一端点的坐标
    return [x, y];
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
