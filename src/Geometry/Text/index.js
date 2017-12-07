/**
 * Created by FDD on 2017/8/21.
 * @desc 文本标绘
 */
import Observable from 'observable-emit'
import mixin from '../utils/mixins'
import {DragBox} from '../events/EventType'
class TextSprite extends mixin(Observable, ol.interaction.Pointer) {
  constructor (params) {
    super()
    this.options = params || {}

    /**
     * @type {ol.render.Box}
     * @private
     */
    this.box_ = new ol.render.Box(this.options.className || 'plot-draw-text')

    /**
     * @type {number}
     * @private
     */
    this.minArea_ = this.options.minArea !== undefined ? this.options.minArea : 64

    /**
     * @type {ol.Pixel}
     * @private
     */
    this.startPixel_ = null

    /**
     * @private
     * @type {ol.EventsConditionType}
     */
    this.condition_ = this.options.condition
      ? this.options.condition : true

    /**
     * @private
     * @type {ol.DragBoxEndConditionType}
     */
    this.boxEndCondition_ = this.options.boxEndCondition
      ? this.options.boxEndCondition : TextSprite.defaultBoxEndCondition

    ol.interaction.Pointer.call(this, {
      handleDownEvent: TextSprite.handleDownEvent_,
      handleDragEvent: TextSprite.handleDragEvent_,
      handleUpEvent: TextSprite.handleUpEvent_
    })
    Observable.call(this)
  }

  /**
   * 拉框结束后获取空间信息
   * @returns {ol.geom.Polygon}
   */
  getGeometry () {
    return this.box_.getGeometry()
  }

  /**
   * 处理鼠标抬起事件
   * @param mapBrowserEvent
   * @returns {boolean}
   * @private
   */
  static handleUpEvent_ (mapBrowserEvent) {
    if (!ol.events.condition.mouseOnly(mapBrowserEvent)) {
      return true
    }
    this.box_.setMap(null)
    if (this.boxEndCondition_(mapBrowserEvent,
        this.startPixel_, mapBrowserEvent.pixel)) {
      this.onBoxEnd(mapBrowserEvent)
      this.dispatch(DragBox.BOXEND, mapBrowserEvent.coordinate, mapBrowserEvent)
    }
    return false
  }

  /**
   * 处理地图drag事件
   * @param mapBrowserEvent
   * @private
   */
  static handleDragEvent_ (mapBrowserEvent) {
    if (!ol.events.condition.mouseOnly(mapBrowserEvent)) {
      return
    }
    this.box_.setPixels(this.startPixel_, mapBrowserEvent.pixel)
    this.dispatch(DragBox.BOXDRAG, mapBrowserEvent.coordinate, mapBrowserEvent)
  }

  /**
   * 用于确定boxend事件是否应该触发的默认条件。
   * @param mapBrowserEvent
   * @param startPixel
   * @param endPixel
   * @returns {boolean}
   */
  static defaultBoxEndCondition (mapBrowserEvent, startPixel, endPixel) {
    var width = endPixel[0] - startPixel[0]
    var height = endPixel[1] - startPixel[1]
    return width * width + height * height >= this.minArea_
  }

  /**
   * 处理鼠标按下事件
   * @param mapBrowserEvent
   * @returns {boolean}
   * @private
   */
  static handleDownEvent_ (mapBrowserEvent) {
    if (!ol.events.condition.mouseOnly(mapBrowserEvent)) {
      return false
    }
    if (ol.events.condition.mouseActionButton(mapBrowserEvent) &&
      this.condition_(mapBrowserEvent)) {
      this.startPixel_ = mapBrowserEvent.pixel
      this.box_.setMap(mapBrowserEvent.map)
      this.box_.setPixels(this.startPixel_, this.startPixel_)
      this.dispatch(DragBox.BOXSTART, mapBrowserEvent.coordinate, mapBrowserEvent)
      return true
    } else {
      return false
    }
  }
}
export default TextSprite
