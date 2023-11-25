import { Map, Overlay, Feature, Observable } from 'ol';
import DragPan from 'ol/interaction/DragPan';

import type { Point } from '@/utils/utils';
import { bindAll } from '@/utils/utils';

import { BASE_HELP_CONTROL_POINT_ID, BASE_HELP_HIDDEN } from '@/constants';
import PlotEvent from '@/core/PlotEvent';
import * as htmlUtils from '../utils/domUtils';

class PlotEdit extends Observable {
  public map: any;

  public mapViewport: HTMLElement;

  public activePlot: WithNull<any>;

  private startPoint: WithNull<Point>;

  private controlPoints: Overlay[];

  private mouseOver: boolean;

  private mapDragPan: WithNull<DragPan>;

  private activeControlPointId: WithNull<string>;

  private elementTable: { [key: string]: number };

  private ghostControlPoints: Point[];

  private previousCursor_: WithNull<string>;

  constructor(map) {
    super();
    if (map && map instanceof Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
    /**
     * 当前地图容器
     * @type {Element}
     */
    this.mapViewport = this.map.getViewport();
    /**
     * 激活绘制工具
     * @type {null}
     */
    this.activePlot = null;
    /**
     * 开始点
     * @type {null}
     */
    this.startPoint = null;
    /**
     * clone的控制点
     * @type {null}
     */
    this.ghostControlPoints = [];
    /**
     * 控制点
     * @type {null}
     */
    this.controlPoints = [];
    /**
     * 鼠标移入
     * @type {boolean}
     */
    this.mouseOver = false;
    /**
     * 元素
     * @type {{}}
     */
    this.elementTable = {};
    /**
     * 当前激活的控制点的ID
     * @type {null}
     */
    this.activeControlPointId = null;
    /**
     * 地图拖拽交互
     * @type {null}
     */
    this.mapDragPan = null;
    /**
     * 未激活之前鼠标样式
     * @type {null}
     * @private
     */
    this.previousCursor_ = null;

    bindAll(
      [
        'controlPointMouseDownHandler',
        'controlPointMouseMoveHandler2',
        'controlPointMouseUpHandler',
        'controlPointMouseMoveHandler',
        'plotMouseOverOutHandler',
        'plotMouseDownHandler',
        'plotMouseUpHandler',
        'plotMouseMoveHandler',
        'handleContextmenu',
      ],
      this,
    );
  }

  /**
   * 初始化提示DOM
   * @returns {boolean}
   */
  private initHelperDom() {
    if (!this.map || !this.activePlot) {
      return false;
    }
    const parent = this.getMapParentElement();
    if (!parent) {
      return false;
    }
    const hiddenDiv = htmlUtils.createHidden('div', parent, BASE_HELP_HIDDEN);
    const cPnts = this.getControlPoints();
    if (cPnts && Array.isArray(cPnts) && cPnts.length > 0) {
      cPnts.forEach((item, index) => {
        const id = `${BASE_HELP_CONTROL_POINT_ID}-${index}`;
        htmlUtils.create('div', BASE_HELP_CONTROL_POINT_ID, hiddenDiv, id);
        this.elementTable[id] = index;
      });
    }
  }

  /**
   * 获取地图元素的父元素
   * @returns {*}
   */
  private getMapParentElement() {
    const mapElement = this.map.getTargetElement();
    if (!mapElement) {
      return false;
    }
    return mapElement.parentNode;
  }

  /**
   * 销毁帮助提示DOM
   */
  private destroyHelperDom() {
    if (this.controlPoints && Array.isArray(this.controlPoints) && this.controlPoints.length > 0) {
      this.controlPoints.forEach((item, index) => {
        if (item && item instanceof Overlay) {
          this.map.removeOverlay(item);
        }
        const element = htmlUtils.getElement(`${BASE_HELP_CONTROL_POINT_ID}-${index}`);
        if (element) {
          htmlUtils.off(element, 'contextmenu', this.handleContextmenu);
          htmlUtils.off(element, 'mousedown', this.controlPointMouseDownHandler);
          htmlUtils.off(element, 'mousemove', this.controlPointMouseMoveHandler2);
        }
      });
      this.controlPoints = [];
    }
    const hiddenDiv = htmlUtils.getElement(BASE_HELP_HIDDEN);
    if (hiddenDiv) {
      htmlUtils.remove(hiddenDiv);
    }
  }

  /**
   * 初始化要素控制点
   */
  private initControlPoints() {
    this.controlPoints = [];
    const cPnts = this.getControlPoints();
    if (cPnts && Array.isArray(cPnts) && cPnts.length > 0) {
      cPnts.forEach((item, index) => {
        const id = `${BASE_HELP_CONTROL_POINT_ID}-${index}`;
        this.elementTable[id] = index;
        const element = htmlUtils.getElement(id);
        if (element) {
          const pnt = new Overlay({
            id,
            position: cPnts[index],
            positioning: 'center-center',
            element,
          });
          this.controlPoints.push(pnt);
          this.map.addOverlay(pnt);
          this.map.render();
          htmlUtils.on(element, 'contextmenu', this.handleContextmenu);
          htmlUtils.on(element, 'mousedown', this.controlPointMouseDownHandler);
          htmlUtils.on(element, 'mousemove', this.controlPointMouseMoveHandler2);
        }
      });
    }
  }

  private handleContextmenu(e) {
    e.preventDefault();
  }

  /**
   * 对控制点的移动事件
   * @param e
   */
  private controlPointMouseMoveHandler2(e) {
    e.stopImmediatePropagation();
  }

  /**
   * 对控制点的鼠标按下事件
   * @param e
   */
  private controlPointMouseDownHandler(e) {
    this.activeControlPointId = e.target.id;
    this.map.un('pointermove', this.controlPointMouseMoveHandler);
    this.map.on('pointermove', this.controlPointMouseMoveHandler);
    htmlUtils.on(this.mapViewport, 'mouseup', this.controlPointMouseUpHandler);
    document.addEventListener('mouseup', this.controlPointMouseUpHandler, true);
  }

  /**
   * 对控制点的移动事件
   * @param event
   */
  private controlPointMouseMoveHandler(event) {
    const coordinate = event.coordinate;
    if (this.activeControlPointId) {
      const plot = this.activePlot.getGeometry();
      const index = this.elementTable[this.activeControlPointId];
      plot.updatePoint(coordinate, index);
      const overlay = this.map.getOverlayById(this.activeControlPointId);
      if (overlay) {
        overlay.setPosition(coordinate);
      }
    }
  }

  /**
   * 对控制点的鼠标抬起事件
   */
  private controlPointMouseUpHandler() {
    this.map.un('pointermove', this.controlPointMouseMoveHandler);
    htmlUtils.off(this.mapViewport, 'mouseup', this.controlPointMouseUpHandler);
    document.removeEventListener('mouseup', this.controlPointMouseUpHandler, true);
  }

  /**
   * 激活工具
   * @param plot
   * @returns {boolean}
   */
  public activate(plot) {
    if (
      plot &&
      plot instanceof Feature &&
      plot.get('isPlot') &&
      plot.getGeometry().isPlot &&
      plot !== this.activePlot
    ) {
      this.deactivate();
      this.activePlot = plot;
      this.previousCursor_ = this.map.getTargetElement().style.cursor;
      window.setTimeout(() => {
        this.dispatchEvent(
          new PlotEvent('activePlotChange', {
            feature: this.activePlot,
          }),
        );
      }, 0);
      this.map.on('pointermove', this.plotMouseOverOutHandler);
      this.initHelperDom();
      this.initControlPoints();
    }
  }

  /**
   * 获取要素的控制点
   * @returns {Array}
   */
  private getControlPoints() {
    let points: Point[] = [];
    if (this.activePlot) {
      const geom = this.activePlot.getGeometry();
      if (geom) {
        points = geom.getPoints();
      }
    }
    return points;
  }

  /**
   * 鼠标移出要编辑的要素范围
   * @param e
   * @returns {T|undefined}
   */
  private plotMouseOverOutHandler(e) {
    const feature = this.map.forEachFeatureAtPixel(e.pixel, (f) => f);
    if (feature && feature === this.activePlot) {
      if (!this.mouseOver) {
        this.mouseOver = true;
        this.map.getTargetElement().style.cursor = 'move';
        this.map.on('pointerdown', this.plotMouseDownHandler);
      }
    } else if (this.mouseOver) {
      this.mouseOver = false;
      this.map.getTargetElement().style.cursor = 'default';
      this.map.un('pointerdown', this.plotMouseDownHandler);
    }
    return feature;
  }

  /**
   * 在要编辑的要素按下鼠标按键
   * @param event
   */
  private plotMouseDownHandler(event) {
    this.ghostControlPoints = this.getControlPoints();
    this.startPoint = event.coordinate;
    this.disableMapDragPan();
    this.map.on('pointerup', this.plotMouseUpHandler);
    this.map.on('pointerdrag', this.plotMouseMoveHandler);
  }

  /**
   * 在要编辑的要素上移动鼠标
   * @param event
   */
  private plotMouseMoveHandler(event) {
    if (!this.startPoint) return;
    const [deltaX, deltaY, newPoints]: [number, number, Point[]] = [
      event.coordinate[0] - this.startPoint[0],
      event.coordinate[1] - this.startPoint[1],
      [],
    ];
    if (this.ghostControlPoints && Array.isArray(this.ghostControlPoints) && this.ghostControlPoints.length > 0) {
      for (let i = 0; i < this.ghostControlPoints.length; i++) {
        const coordinate = [this.ghostControlPoints[i][0] + deltaX, this.ghostControlPoints[i][1] + deltaY] as Point;
        newPoints.push(coordinate);
        const id = `${BASE_HELP_CONTROL_POINT_ID}-${i}`;
        const overlay = this.map.getOverlayById(id);
        if (overlay) {
          overlay.setPosition(coordinate);
          overlay.setPositioning('center-center');
        }
      }
    }
    const _geometry = this.activePlot.getGeometry();
    _geometry.setPoints(newPoints);
  }

  /**
   * 鼠标抬起事件
   */
  private plotMouseUpHandler() {
    this.enableMapDragPan();
    this.map.un('pointerup', this.plotMouseUpHandler);
    this.map.un('pointerdrag', this.plotMouseMoveHandler);
  }

  /**
   * 取消事件关联
   */
  private disconnectEventHandlers() {
    this.map.un('pointermove', this.plotMouseOverOutHandler);
    this.map.un('pointermove', this.controlPointMouseMoveHandler);
    document.removeEventListener('mouseup', this.controlPointMouseUpHandler, true);
    htmlUtils.off(this.mapViewport, 'mouseup', this.controlPointMouseUpHandler);
    this.map.un('pointerdown', this.plotMouseDownHandler);
    this.map.un('pointerup', this.plotMouseUpHandler);
    this.map.un('pointerdrag', this.plotMouseMoveHandler);
  }

  /**
   * 取消激活工具
   */
  public deactivate() {
    if (this.activePlot) {
      this.dispatchEvent(
        new PlotEvent('deactivatePlot', {
          feature: this.activePlot,
        }),
      );
    }
    this.activePlot = null;
    this.mouseOver = false;
    this.map.getTargetElement().style.cursor = this.previousCursor_;
    this.previousCursor_ = null;
    this.destroyHelperDom();
    this.disconnectEventHandlers();
    this.enableMapDragPan();
    this.elementTable = {};
    this.activeControlPointId = null;
    this.startPoint = null;
  }

  /**
   * 禁止地图的拖拽平移
   */
  private disableMapDragPan() {
    const interactions = this.map.getInteractions().getArray();
    interactions.every((item) => {
      if (item instanceof DragPan) {
        this.mapDragPan = item;
        this.map.removeInteraction(item);
        return false;
      }
      return true;
    });
  }

  /**
   * 激活地图的拖拽平移
   */
  private enableMapDragPan() {
    if (this.mapDragPan) {
      this.map.addInteraction(this.mapDragPan);
      this.mapDragPan = null;
    }
  }
}
export default PlotEdit;
