/**
 * Created by FDD on 2017/5/25.
 * @desc 扇形
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol';
import { Polygon as $Polygon } from 'ol/geom';
import { PlotTypes } from '@/utils/PlotTypes';
import * as PlotUtils from '@/utils/utils';
import type { Point } from '@/utils/utils';

class Sector extends $Polygon {
  type: PlotTypes;

  fixPointCount: WithUndef<number>;

  map: any;

  points: Point[];

  freehand: boolean;

  constructor(coordinates, points, params) {
    super([]);
    this.type = PlotTypes.SECTOR;
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
      const [center, pnt2, pnt3] = [pnts[0], pnts[1], pnts[2]];
      const radius = PlotUtils.MathDistance(pnt2, center);
      const startAngle = PlotUtils.getAzimuth(pnt2, center);
      const endAngle = PlotUtils.getAzimuth(pnt3, center);
      const pList = PlotUtils.getArcPoints(center, radius, startAngle, endAngle);
      pList.push(center, pList[0]);
      this.setCoordinates([pList]);
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

export default Sector;
