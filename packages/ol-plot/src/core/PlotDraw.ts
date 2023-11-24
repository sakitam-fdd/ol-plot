import { Map, Observable, Feature } from 'ol';
import Draw, { createBox } from 'ol/interaction/Draw';
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';
import { Style, Icon, Stroke, Fill } from 'ol/style';

import type VectorLayer from 'ol/layer/Vector';
import { getuuid, MathDistance, bindAll } from '@/utils/utils';
import { BASE_LAYERNAME } from '@/constants';
import { createVectorLayer } from '@/utils/layerUtils';
import type { PlotTypesSource } from '@/utils/PlotTypes';
import { PlotTypes } from '@/utils/PlotTypes';
import type { Point } from '@/utils/utils';
import type olPlot from '../index';
import PlotEvent from './PlotEvent';
import PlotTextBox from '../Geometry/Text/PlotTextBox';
import * as Plots from '../Geometry';

class PlotDraw extends Observable {
  public map: any;

  public ctx: olPlot;

  public options: any;

  public feature: WithNull<Feature>;

  public points: any[];

  public plotType: WithNull<PlotTypes>;

  public plotParams: any;

  public mapViewport: HTMLElement;

  public layerName: string;

  public drawLayer: VectorLayer<any>;

  public plot: WithNull<PlotTypesSource>;

  private drawInteraction_: WithNull<Draw>;

  private dblClickZoomInteraction: WithNull<DoubleClickZoom>;

  constructor(map, params, ctx) {
    super();
    if (map && map instanceof Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }

    this.ctx = ctx;

    this.options = params || {};
    /**
     * 交互点
     */
    this.points = [];
    /**
     * 当前标绘工具
     * @type {null}
     */
    this.plot = null;
    /**
     * 当前要素
     * @type {null}
     */
    this.feature = null;
    /**
     * 标绘类型
     * @type {null}
     */
    this.plotType = null;
    /**
     * 当前标绘参数
     * @type {null}
     */
    this.plotParams = null;
    /**
     * 当前地图视图
     * @type {Element}
     */
    this.mapViewport = this.map.getViewport();
    /**
     * 地图双击交互
     * @type {null}
     */
    this.dblClickZoomInteraction = null;

    /**
     * draw交互工具
     * @type {null}
     * @private
     */
    this.drawInteraction_ = null;

    /**
     * 创建图层名称
     * @type {string}
     */
    this.layerName = this.options && this.options.layerName ? this.options.layerName : BASE_LAYERNAME;

    bindAll(
      [
        'textAreaDrawStart',
        'textAreaDrawEnd',
        'mapFirstClickHandler',
        'mapNextClickHandler',
        'mapDoubleClickHandler',
        'mapMouseMoveHandler',
      ],
      this,
    );

    /**
     * 当前矢量图层
     * @type {*}
     */
    this.drawLayer = createVectorLayer(this.map, this.layerName, {
      create: true,
    }) as VectorLayer<any>;
    this.drawLayer.setZIndex(this.options.zIndex || 99);
  }

  /**
   * 创建Plot
   * @param type
   * @param points
   * @param _params
   * @returns {*}
   */
  private createPlot(type: PlotTypes, points: Point[], _params: any): WithNull<PlotTypesSource> {
    const params = _params || {};
    switch (type) {
      case PlotTypes.TEXTAREA:
        return null;
      case PlotTypes.POINT:
        return new Plots.Point([], points, params);
      case PlotTypes.PENNANT:
        return new Plots.Pennant([], points, params);
      case PlotTypes.POLYLINE:
        return new Plots.Polyline([], points, params);
      case PlotTypes.ARC:
        return new Plots.Arc([], points, params);
      case PlotTypes.CIRCLE:
        return new Plots.Circle([], points, params);
      case PlotTypes.CURVE:
        return new Plots.Curve([], points, params);
      case PlotTypes.FREEHANDLINE:
        return new Plots.FreeHandLine([], points, params);
      case PlotTypes.RECTANGLE:
        return new Plots.RectAngle([], points, params);
      case PlotTypes.ELLIPSE:
        return new Plots.Ellipse([], points, params);
      case PlotTypes.LUNE:
        return new Plots.Lune([], points, params);
      case PlotTypes.SECTOR:
        return new Plots.Sector([], points, params);
      case PlotTypes.CLOSED_CURVE:
        return new Plots.ClosedCurve([], points, params);
      case PlotTypes.POLYGON:
        return new Plots.Polygon([], points, params);
      case PlotTypes.ATTACK_ARROW:
        return new Plots.AttackArrow([], points, params);
      case PlotTypes.FREE_POLYGON:
        return new Plots.FreePolygon([], points, params);
      case PlotTypes.DOUBLE_ARROW:
        return new Plots.DoubleArrow([], points, params);
      case PlotTypes.STRAIGHT_ARROW:
        return new Plots.StraightArrow([], points, params);
      case PlotTypes.FINE_ARROW:
        return new Plots.FineArrow([], points, params);
      case PlotTypes.ASSAULT_DIRECTION:
        return new Plots.AssaultDirection([], points, params);
      case PlotTypes.TAILED_ATTACK_ARROW:
        return new Plots.TailedAttackArrow([], points, params);
      case PlotTypes.SQUAD_COMBAT:
        return new Plots.SquadCombat([], points, params);
      case PlotTypes.TAILED_SQUAD_COMBAT:
        return new Plots.TailedSquadCombat([], points, params);
      case PlotTypes.GATHERING_PLACE:
        return new Plots.GatheringPlace([], points, params);
      case PlotTypes.RECTFLAG:
        return new Plots.RectFlag([], points, params);
      case PlotTypes.TRIANGLEFLAG:
        return new Plots.TriangleFlag([], points, params);
      case PlotTypes.CURVEFLAG:
        return new Plots.CurveFlag([], points, params);
      case PlotTypes.RECTINCLINED1:
        return new Plots.RectInclined1([], points, params);
      case PlotTypes.RECTINCLINED2:
        return new Plots.RectInclined2([], points, params);
      default:
        console.warn('暂不支持此类型', type);
    }
    return null;
  }

  public active(type: PlotTypes, params = {}) {
    this.activate(type, params);
    console.warn('[ol-plot]: active 方法即将废弃，请使用 activate');
  }

  /**
   * 激活工具
   * @param type
   * @param params
   */
  public activate(type, params = {}) {
    this.deactivate();
    this.deactiveMapTools();
    this.plotType = type;
    this.plotParams = params;
    if (type === PlotTypes.TEXTAREA) {
      this.activeInteraction();
    } else if (Object.keys(PlotTypes).some((key) => PlotTypes[key] === type)) {
      this.map.on('click', this.mapFirstClickHandler);
    } else {
      console.warn('不存在的标绘类型！');
    }
  }

  /**
   * 激活交互工具
   */
  activeInteraction() {
    this.drawInteraction_ = new Draw({
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.7)',
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.15)',
          width: 2,
        }),
        image: new Icon({
          anchor: [1, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          opacity: 0.75,
          // eslint-disable-next-line max-len
          src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABgklEQVQ4T41T0W3CQAy1lfwRqR0h/CE5UhkBJmiZADpB0wlKJwA2aDegE5QR+Igl/noj9OPuLydXPuXQEYUKS5FyPvvd87ONRDRFxEdr7c4Y8ws3WFmW90VRvIjIF1ZVtQaANxH59N6v8zwvRaQEgCMATDu88I+Ipm1bk2XZHhEfAOAdFW00Gh2YOQafOeidHoaYEdGHc65GDZhMJuXpdDJ99hqkPmZe9e9iTgCoqmrWNM0hDerq/FGftXbcZxFzAgARrZg5vBaNiGpE3OhZRF6Zedu7DzkRYMrMKlQKYBBRQVVgw8zj3n3IGWSg9ESkds6tiqJQbe4AYJ6WGVkPAqh4+romdP9LbXMqZh/gXIKqm+d5EK9vbduOY7d0AAdL6AYLmqbRAQtGRMc4ONF/wSC2RF/PsuwbABapqLEjKqb3fq4sLtoYh6Lbiydr7TbtuwYDgH5qB9XmPEjdKG+Y+Xmo7ms+Lcs5N0uX6ei9X9y4TGtEXIZlukb7PzbdmNcisv8DtQILak2vZsYAAAAASUVORK5CYII=',
        }),
      }),
      type: 'Circle',
      geometryFunction: createBox(),
    });
    this.map.addInteraction(this.drawInteraction_);
    this.drawInteraction_.on('drawstart', this.textAreaDrawStart);
    this.drawInteraction_.on('drawend', this.textAreaDrawEnd);
  }

  textAreaDrawStart(event) {
    this.dispatchEvent(
      new PlotEvent('drawStart', {
        originalEvent: event,
        feature: null,
        plotType: PlotTypes.TEXTAREA,
      }),
    );
  }

  /**
   * 绘制结束
   * @param event
   */
  textAreaDrawEnd(event) {
    let _plotText;
    if (event && event.feature) {
      const extent = event.feature.getGeometry().getExtent();
      const _center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
      const topLeft = this.map.getPixelFromCoordinate([extent[0], extent[1]]);
      const bottomRight = this.map.getPixelFromCoordinate([extent[2], extent[3]]);
      const [_width, _height] = [Math.abs(topLeft[0] - bottomRight[0]), Math.abs(topLeft[1] - bottomRight[1])];
      _plotText = new PlotTextBox(
        {
          id: getuuid(),
          position: _center,
          value: '',
          width: _width,
          height: _height,
          style: {
            width: `${_width}px`,
            height: `${_height}px`,
          },
        },
        this.ctx,
      );
      if (this.map && this.map instanceof Map && _plotText) {
        this.map.addOverlay(_plotText);
      } else {
        console.warn('未传入地图对象或者plotText创建失败！');
      }
    } else {
      console.info('未获取到要素！');
    }

    this.dispatchEvent(
      new PlotEvent('drawEnd', {
        originalEvent: event,
        feature: _plotText,
        plotType: PlotTypes.TEXTAREA,
      }),
    );

    this.deactivate();
  }

  disActive() {
    this.deactivate();
    console.warn('[ol-plot]: disActive 方法即将废弃，请使用 deactivate');
  }

  /**
   * 取消激活状态
   */
  public deactivate() {
    this.removeEventHandlers();
    if (this.drawInteraction_) {
      this.map.removeInteraction(this.drawInteraction_);
      this.drawInteraction_ = null;
    }
    this.points = [];
    this.plot = null;
    this.feature = null;
    this.plotType = null;
    this.plotParams = null;
    this.activateMapTools();
  }

  /**
   * PLOT是否处于激活状态
   * @returns {boolean}
   */
  public isDrawing(): boolean {
    return !!this.plotType;
  }

  /**
   * 地图事件处理
   * 激活工具后第一次点击事件
   * @param event
   */
  private mapFirstClickHandler(event) {
    this.map.un('click', this.mapFirstClickHandler);
    this.points.push(event.coordinate);
    this.plot = this.createPlot(this.plotType as PlotTypes, this.points, this.plotParams);

    if (!this.plot) return;

    this.feature = new Feature(this.plot);
    this.dispatchEvent(
      new PlotEvent('drawStart', {
        originalEvent: event,
        feature: this.feature,
        plotType: this.plotType,
      }),
    );
    this.feature.set('isPlot', true);
    this.drawLayer.getSource().addFeature(this.feature);
    if (this.plotType === PlotTypes.POINT || this.plotType === PlotTypes.PENNANT) {
      this.plot.finishDrawing();
      this.drawEnd(event);
    } else {
      this.map.on('click', this.mapNextClickHandler);
      if (!this.plot.freehand) {
        this.map.on('dblclick', this.mapDoubleClickHandler);
      }
      this.map.un('pointermove', this.mapMouseMoveHandler);
      this.map.on('pointermove', this.mapMouseMoveHandler);
    }
    if (this.plotType && this.feature) {
      this.plotParams.plotType = this.plotType;
      this.feature.setProperties(this.plotParams);
    }
  }

  /**
   * 地图点击事件处理
   * @param event
   * @returns {boolean}
   */
  private mapNextClickHandler(event) {
    if (!this.plot) return;

    if (!this.plot.freehand) {
      if (MathDistance(event.coordinate, this.points[this.points.length - 1]) < 0.0001) {
        return false;
      }
    }
    this.points.push(event.coordinate);
    this.plot.setPoints(this.points);
    if (this.plot.fixPointCount === this.plot.getPointCount()) {
      this.mapDoubleClickHandler(event);
    }
    if (this.plot && this.plot.freehand) {
      this.mapDoubleClickHandler(event);
    }
  }

  /**
   * 地图双击事件处理
   * @param event
   */
  private mapDoubleClickHandler(event) {
    event.preventDefault();

    if (!this.plot) return;

    this.plot.finishDrawing();
    this.drawEnd(event);
  }

  /**
   * 地图事件处理
   * 鼠标移动事件
   * @param event
   * @returns {boolean}
   */
  private mapMouseMoveHandler(event) {
    const coordinate = event.coordinate;
    if (!this.plot) return;
    if (MathDistance(coordinate, this.points[this.points.length - 1]) < 0.0001) {
      return false;
    }
    if (!this.plot.freehand) {
      const pnts = this.points.concat([coordinate]);
      this.plot.setPoints(pnts);
    } else {
      this.points.push(coordinate);
      this.plot.setPoints(this.points);
    }
  }

  /**
   * 移除事件监听
   */
  private removeEventHandlers() {
    this.map.un('click', this.mapFirstClickHandler);
    this.map.un('click', this.mapNextClickHandler);
    this.map.un('pointermove', this.mapMouseMoveHandler);
    this.map.un('dblclick', this.mapDoubleClickHandler);
  }

  /**
   * 绘制结束
   */
  private drawEnd(event) {
    this.dispatchEvent(
      new PlotEvent('drawEnd', {
        originalEvent: event,
        feature: this.feature,
        plotType: this.plotType,
      }),
    );
    if (this.feature && this.options.isClear) {
      this.drawLayer.getSource().removeFeature(this.feature);
    }
    this.deactivate();
  }

  /**
   * 添加要素
   */
  public addFeature() {
    this.feature = new Feature(this.plot as any);
    if (this.feature && this.drawLayer) {
      this.drawLayer.getSource().addFeature(this.feature);
    }
  }

  /**
   * 取消激活地图交互工具
   */
  private deactiveMapTools() {
    const interactions = this.map.getInteractions().getArray();
    interactions.every((item) => {
      if (item instanceof DoubleClickZoom) {
        this.dblClickZoomInteraction = item;
        this.map.removeInteraction(item);
        return false;
      }
      return true;
    });
  }

  /**
   * 激活已取消的地图工具
   * 还原之前状态
   */
  private activateMapTools() {
    if (this.dblClickZoomInteraction) {
      this.map.addInteraction(this.dblClickZoomInteraction);
      this.dblClickZoomInteraction = null;
    }
  }
}

export default PlotDraw;
