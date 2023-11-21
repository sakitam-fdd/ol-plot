/**
 * Created by wh on 2023.6.1
 * @desc 斜矩形2
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
    this.type = PlotTypes.RECTINCLINED2;
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
      const intersect = this.calculateIntersectionPoint(pnt1, pnt2, mouse);
      const pnt4 = this.calculateFourthPoint(pnt1, intersect, mouse);
      const pList: Point[] = [];
      pList.push(pnt1, intersect, mouse, pnt4, pnt1);
      this.setCoordinates([pList]);
    }
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
   * 已知p1点和p2点，求p3点到p1p2垂线的交点
   * @param {*} p1
   * @param {*} p2
   * @param {*} p3
   */
  calculateIntersectionPoint(p1, p2, p3): Point {
    const v = {
      x: p2[0] - p1[0],
      y: p2[1] - p1[1],
    };
    const u = {
      x: p3[0] - p1[0],
      y: p3[1] - p1[1],
    };
    const projectionLength = (u.x * v.x + u.y * v.y) / (v.x * v.x + v.y * v.y);
    const intersectionPoint: { x: number; y: number } = {
      x: p1[0] + v.x * projectionLength,
      y: p1[1] + v.y * projectionLength,
    };
    return [intersectionPoint.x, intersectionPoint.y];
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
