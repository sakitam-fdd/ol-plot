import { Map, Overlay } from 'ol';
import DragPan from 'ol/interaction/DragPan';
import autosize from 'autosize';
import { DEF_TEXT_STYEL } from '@/constants';
import { merge, bindAll } from '@/utils/utils';
import { on, off, hasClass, setStyle, getStyle } from '@/utils/domUtils';
import PlotEvent from '@/core/PlotEvent';
import type olPlot from '@/index';
import type { Coordinate } from '@/types';

interface PlotTextBoxOptions {
  id?: string;
  element?: HTMLElement;
  offset?: number[];
  stopEvent?: boolean;
  positioning?: any;
  insertFirst?: boolean;
  autoPan?: boolean | Record<string, unknown>;
  autoPanAnimation?: Record<string, unknown>;
  autoPanMargin?: number;
  className?: string;
  position?: Coordinate;
  width?: number;
  height?: number;
  minHeight?: number;
  value?: string;
  style?: Record<string, unknown>;
}

class PlotTextBox extends Overlay {
  public parent: olPlot;

  public freehand: boolean;

  private mapDragPan?: DragPan;

  private mapDragPanWasActive = false;

  private isClick_: boolean;

  private dragging_: boolean;

  private isFocus_: boolean;

  private options_: PlotTextBoxOptions;

  private _position: Coordinate | undefined;

  private handleTimer_: number | null;

  private currentPixel_: number[];

  private preCursor_ = '';

  // eslint-disable-next-line default-param-last
  constructor(options: PlotTextBoxOptions = {}, parent: olPlot) {
    const [
      id,
      element,
      offset,
      stopEvent,
      positioning,
      insertFirst,
      autoPan,
      autoPanAnimation,
      autoPanMargin,
      className,
    ] = [
      options.id,
      options.element,
      options.offset,
      options.stopEvent,
      options.positioning,
      options.insertFirst,
      options.autoPan,
      options.autoPanAnimation,
      options.autoPanMargin,
      options.className ? options.className : 'ol-plot-text-editor',
    ];
    super({
      id,
      element,
      stopEvent,
      insertFirst,
      autoPan,
      autoPanAnimation,
      autoPanMargin,
      className,
    } as any);

    this.parent = parent;

    this.setOffset(offset !== undefined ? offset : [0, 0]);
    this.setPositioning(positioning !== undefined ? positioning : 'center-center');

    /**
     * 地图交互
     * @type {undefined}
     */
    this.mapDragPan = undefined;

    /**
     * is click
     * @type {boolean}
     * @private
     */
    this.isClick_ = false;

    /**
     * 是否处于拖拽状态
     * @type {boolean}
     * @private
     */
    this.dragging_ = false;

    /**
     * 当前气泡是否获取焦点
     * @type {boolean}
     * @private
     */
    this.isFocus_ = false;

    /**
     * 当前配置信息
     * @type {{}}
     * @private
     */
    this.options_ = options;

    /**
     * 当前气泡位置
     * @type {Array}
     * @private
     */
    this._position = options.position && options.position.length > 0 ? options.position : undefined;

    /**
     * 防抖延时
     * @type {null}
     * @private
     */
    this.handleTimer_ = null;

    /**
     * 每次鼠标按下的位置
     * @type {Array}
     * @private
     */
    this.currentPixel_ = [];

    this.freehand = false;

    bindAll(
      [
        'handleFocus_',
        'handleBlur_',
        'handleClick_',
        'handleDragStart_',
        'handleDragEnd_',
        'handleDragDrag_',
        'closeCurrentPlotText',
        'handleResizeMouseDown_',
        'handleResizeMouseMove_',
        'handleResizeMouseUp_',
        'resizeButtonMoveHandler_',
      ],
      this,
    );

    /**
     * 创建text content
     */
    this.createTextContent(options);
  }

  /**
   * 创建文本框父容器
   * @param options
   */
  createTextContent(options: PlotTextBoxOptions) {
    const _className = options.className || 'ol-plot-text-editor';
    const content = document.createElement('textarea');
    content.className = _className;
    content.style.width = `${options.width}px`;
    content.style.height = `${options.height}px`;
    content.style.minHeight = `${options.minHeight}px`;
    if (options.id) content.setAttribute('id', options.id);
    content.setAttribute('autofocus', 'true');
    autosize(content);
    on(content, 'focus', this.handleFocus_);
    on(content, 'blur', this.handleBlur_);
    on(content, 'click', this.handleClick_);
    on(content, 'mousedown', this.handleDragStart_);
    on(window, 'mouseup', this.handleDragEnd_);
    this.set('isPlotText', true);
    this.setElement(content);
    this.createCloseButton(options);
    this.createResizeButton(options);
    this.setPosition(this._position);
    this.dispatchEvent(
      new PlotEvent('textBoxDrawEnd', {
        overlay: this,
        element: content,
        uuid: options.id,
      }),
    );
  }

  /**
   * 获取文本框
   * @returns {string}
   * @private
   */
  getTextAreaFromContent_(): HTMLTextAreaElement | null {
    let _node: HTMLTextAreaElement | null = null;
    const childrens_ = Array.prototype.slice.call(this.element && this.element.children, 0);
    if (childrens_.length > 0) {
      childrens_.every((ele) => {
        if (ele.nodeType === 1 && ele.nodeName.toLowerCase() === 'textarea') {
          _node = ele as HTMLTextAreaElement;
          return false;
        }
        return true;
      });
    }
    return _node;
  }

  /**
   * 创建关闭按钮
   * @param options
   */
  createCloseButton(options: PlotTextBoxOptions) {
    const _closeSpan = document.createElement('span');
    _closeSpan.className = 'ol-plot-text-editor-close';
    if (options.id) _closeSpan.setAttribute('data-id', options.id);
    off(_closeSpan, 'click', this.closeCurrentPlotText);
    on(_closeSpan, 'click', this.closeCurrentPlotText);
    this.element.appendChild(_closeSpan);
  }

  /**
   * 创建文本框大小调整按钮
   * @param options
   */
  createResizeButton(options: PlotTextBoxOptions) {
    const _resizeSpan = document.createElement('span');
    _resizeSpan.className = 'ol-plot-text-editor-resize';
    if (options.id) _resizeSpan.setAttribute('data-id', options.id);
    off(_resizeSpan, 'mousedown', this.handleResizeMouseDown_);
    off(_resizeSpan, 'mousemove', this.handleResizeMouseMove_);
    on(_resizeSpan, 'mousedown', this.handleResizeMouseDown_);
    on(_resizeSpan, 'mousemove', this.handleResizeMouseMove_);
    this.element.appendChild(_resizeSpan);
  }

  /**
   * 调整大小
   * @param event
   * @private
   */
  resizeButtonMoveHandler_(event) {
    const pixel_ = event.pixel;
    const element_ = this.getTextAreaFromContent_();
    if (pixel_.length < 1 || this.currentPixel_.length < 1 || !element_) return;
    const _offset = [pixel_[0] - this.currentPixel_[0], pixel_[1] - this.currentPixel_[1]];
    const _size = [element_.offsetWidth, element_.offsetHeight];
    const _width = _size[0] + _offset[0] * 2;
    const _height = _size[1] + _offset[1] * 2;
    setStyle(element_, 'width', `${_width}px`);
    setStyle(element_, 'height', `${_height}px`);
    this.currentPixel_ = pixel_;
    this.getMap()?.render();
  }

  /**
   * 处理移动事件
   * @param event
   * @private
   */
  handleResizeMouseMove_(event) {
    event.stopImmediatePropagation();
  }

  /**
   * 处理鼠标按下事件
   * @param event
   * @private
   */
  handleResizeMouseDown_(event) {
    const map = this.getMap();
    if (!map) return;
    this.currentPixel_ = [event.x, event.y];
    map.on('pointermove', this.resizeButtonMoveHandler_);
    on(map.getViewport(), 'mouseup', this.handleResizeMouseUp_);
  }

  /**
   * 处理鼠标抬起事件，移除所有事件监听
   * @private
   */
  handleResizeMouseUp_() {
    const map = this.getMap();
    if (!map) return;
    map.un('pointermove', this.resizeButtonMoveHandler_);
    off(map.getViewport(), 'mouseup', this.handleResizeMouseUp_);
    this.currentPixel_ = [];
  }

  /**
   * 处理关闭事件
   * @param event
   */
  closeCurrentPlotText(event) {
    const map = this.getMap();
    if (!map) return;
    if (event && hasClass(event.target, 'ol-plot-text-editor-close')) {
      const _id = event.target.getAttribute('data-id');
      if (_id) {
        const _overlay = map.getOverlayById(_id);
        if (_overlay) {
          map.removeOverlay(_overlay);
        }
      }
    }
  }

  /**
   * 处理获取焦点事件
   * @private
   */
  handleFocus_() {
    this.isFocus_ = true;
    if (this.parent) {
      this.parent.dispatchEvent(
        new PlotEvent('activeTextArea', {
          overlay: this,
        }),
      );
    }
  }

  /**
   * 处理失去焦点事件
   * @private
   */
  handleBlur_() {
    this.isFocus_ = false;
    if (this.parent) {
      this.parent.dispatchEvent(
        new PlotEvent('deactivateTextArea', {
          overlay: this,
        }),
      );
    }
  }

  /**
   * 处理拖拽开始
   * @private
   */
  handleDragStart_() {
    if (!this.getMap()) return;
    if (!this.dragging_ && this.isMoveModel() && this.isFocus_) {
      this.handleTimer_ = window.setTimeout(() => {
        if (this.handleTimer_ !== null) window.clearTimeout(this.handleTimer_);
        this.handleTimer_ = null;
        if (!this.isClick_) {
          this.dragging_ = true;
          this.disableMapDragPan();
          this.preCursor_ = this.element.style.cursor;
          const map = this.getMap();
          if (map) on(map.getViewport(), 'mousemove', this.handleDragDrag_);
          on(this.element, 'mouseup', this.handleDragEnd_);
        }
      }, 300);
    }
  }

  /**
   * 处理拖拽
   * @param event
   * @private
   */
  handleDragDrag_(event) {
    const map = this.getMap();
    if (this.dragging_ && map) {
      this.element.style.cursor = 'move';
      this._position = map.getCoordinateFromPixel([event.clientX, event.clientY]) as Coordinate;
      this.setPosition(this._position);
    }
  }

  /**
   * 处理拖拽
   * @private
   */
  handleDragEnd_() {
    this.isClick_ = false;
    if (this.handleTimer_ !== null) window.clearTimeout(this.handleTimer_);
    this.handleTimer_ = null;
    if (this.dragging_ && this.isFocus_) {
      this.dragging_ = false;
      this.enableMapDragPan();
      this.element.style.cursor = this.preCursor_;
      const map = this.getMap();
      if (map) off(map.getViewport(), 'mousemove', this.handleDragDrag_);
      off(this.element, 'mouseup', this.handleDragEnd_);
    }
  }

  /**
   * 处理点击事件
   * @param event
   * @private
   */
  handleClick_(event) {
    if (event.target === this.element) {
      this.isClick_ = true;
    } else {
      this.isClick_ = false;
    }
  }

  /**
   * 是否处于选择模式
   * @returns {boolean}
   */
  isMoveModel() {
    if (typeof window === 'undefined') return false;
    try {
      const selection = window.getSelection();
      if (selection) {
        if (selection.rangeCount === 0) return false;
        const range = selection.getRangeAt(0);
        return range.collapsed;
      }

      return false;
    } catch (e) {
      console.error('[ol-plot]: PlotTextBox check move error', e);
    }
  }

  /**
   * 设置样式
   * @param style
   */
  setStyle(style = {}) {
    const _element = this.getTextAreaFromContent_();
    if (_element) {
      // eslint-disable-next-line no-restricted-syntax
      for (const key in style) {
        if (style[key]) {
          setStyle(_element, key, style[key]);
        }
      }
    }
  }

  /**
   * 获取当前样式
   * @returns {CSSStyleDeclaration}
   */
  getStyle() {
    const _style = {};
    const _element = this.getTextAreaFromContent_();
    if (_element) {
      // eslint-disable-next-line no-restricted-syntax
      for (const key in DEF_TEXT_STYEL) {
        _style[key] = getStyle(_element, key);
      }
    }
    return _style;
  }

  /**
   * set value
   * @param value
   */
  setValue(value) {
    const _element = this.getTextAreaFromContent_();
    if (_element) {
      _element.value = value;
      if (value) {
        autosize.update(_element);
      }
      this.getMap()?.render();
    }
  }

  /**
   * get value
   * @returns {*}
   */
  getValue() {
    const _element = this.getTextAreaFromContent_();
    if (_element) {
      return _element.value;
    }
    return '';
  }

  /**
   * 获取宽度
   * @returns {number}
   */
  getWidth() {
    const element_ = this.getTextAreaFromContent_();
    if (element_ && element_.offsetWidth) {
      return element_.offsetWidth;
    }
    return 0;
  }

  /**
   * 获取高度
   * @returns {number}
   */
  getHeight() {
    const element_ = this.getTextAreaFromContent_();
    if (element_ && element_.offsetHeight) {
      return element_.offsetHeight;
    }
    return 0;
  }

  /**
   * 激活地图的拖拽平移
   */
  enableMapDragPan() {
    const _map = this.getMap();
    if (!_map) return;
    if (this.mapDragPan) {
      this.mapDragPan.setActive(this.mapDragPanWasActive);
      this.mapDragPan = undefined;
      this.mapDragPanWasActive = false;
    }
  }

  /**
   * 禁止地图的拖拽平移
   */
  disableMapDragPan() {
    const _map = this.getMap();
    if (!_map) return;
    const interactions = _map.getInteractions().getArray();
    interactions.every((item) => {
      if (item instanceof DragPan || item.constructor.name.indexOf('DragPan') > -1) {
        this.mapDragPan = item as DragPan;
        this.mapDragPanWasActive = item.getActive();
        item.setActive(false);
        return false;
      }
      return true;
    });
  }

  /**
   * set map
   * @param map
   */
  setMap(map: Map | null) {
    super.setMap(map);
    if (map && map instanceof Map) {
      this.setStyle(merge({ ...DEF_TEXT_STYEL }, this.options_.style || {}));
      this.setValue(this.options_.value);
    }
  }

  protected disposeInternal() {
    const element = this.getTextAreaFromContent_();
    if (element) {
      off(element, 'focus', this.handleFocus_);
      off(element, 'blur', this.handleBlur_);
      off(element, 'click', this.handleClick_);
      off(element, 'mousedown', this.handleDragStart_);
      autosize.destroy(element);
    }
    off(window, 'mouseup', this.handleDragEnd_);
    this.handleResizeMouseUp_();
    this.handleDragEnd_();
    super.disposeInternal();
  }

  finishDrawing() {}
}

export default PlotTextBox;
