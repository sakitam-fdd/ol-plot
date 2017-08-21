/**
 * Created by FDD on 2017/8/21.
 * @desc 文本标绘
 */
import Observable from 'observable-emit'
const TextSprite = function (params) {
  this.options = params || {}
  ol.interaction.Pointer.call(this, {
    handleDownEvent: TextSprite.handleDownEvent_,
    handleDragEvent: TextSprite.handleDragEvent_,
    handleUpEvent: TextSprite.handleUpEvent_
  })
  Observable.call(this)

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
    ? this.options.condition : ol.events.condition.always

  /**
   * @private
   * @type {ol.DragBoxEndConditionType}
   */
  this.boxEndCondition_ = this.options.boxEndCondition
    ? this.options.boxEndCondition : ol.interaction.DragBox.defaultBoxEndCondition
}

ol.inherits(TextSprite, ol.interaction.Pointer)
// ol.inherits(TextSprite, Observable)

/**
 * 用于确定boxend事件是否应该触发的默认条件。
 * @param mapBrowserEvent
 * @param startPixel
 * @param endPixel
 * @returns {boolean}
 */
TextSprite.defaultBoxEndCondition = function (mapBrowserEvent, startPixel, endPixel) {
  var width = endPixel[0] - startPixel[0]
  var height = endPixel[1] - startPixel[1]
  return width * width + height * height >= this.minArea_
}

/**
 * 处理地图drag事件
 * @param mapBrowserEvent
 * @private
 */
TextSprite.handleDragEvent_ = function (mapBrowserEvent) {
  if (!ol.events.condition.mouseOnly(mapBrowserEvent)) {
    return
  }
  this.box_.setPixels(this.startPixel_, mapBrowserEvent.pixel)
  this.dispatchEvent(new TextSprite.Event(TextSprite.EventType_.BOXDRAG,
    mapBrowserEvent.coordinate, mapBrowserEvent))
}

/**
 * 拉框结束后获取空间信息
 * @returns {ol.geom.Polygon}
 */
TextSprite.prototype.getGeometry = function () {
  return this.box_.getGeometry()
}

/**
 * 处理鼠标抬起事件
 * @param mapBrowserEvent
 * @returns {boolean}
 * @private
 */
TextSprite.handleUpEvent_ = function (mapBrowserEvent) {
  if (!ol.events.condition.mouseOnly(mapBrowserEvent)) {
    return true
  }
  this.box_.setMap(null)
  if (this.boxEndCondition_(mapBrowserEvent,
      this.startPixel_, mapBrowserEvent.pixel)) {
    this.onBoxEnd(mapBrowserEvent)
    this.dispatchEvent(new TextSprite.Event(TextSprite.EventType_.BOXEND,
      mapBrowserEvent.coordinate, mapBrowserEvent))
  }
  return false
}

/**
 * 处理鼠标按下事件
 * @param mapBrowserEvent
 * @returns {boolean}
 * @private
 */
TextSprite.handleDownEvent_ = function (mapBrowserEvent) {
  if (!ol.events.condition.mouseOnly(mapBrowserEvent)) {
    return false
  }
  if (ol.events.condition.mouseActionButton(mapBrowserEvent) &&
    this.condition_(mapBrowserEvent)) {
    this.startPixel_ = mapBrowserEvent.pixel
    this.box_.setMap(mapBrowserEvent.map)
    this.box_.setPixels(this.startPixel_, this.startPixel_)
    this.dispatchEvent(new TextSprite.Event(TextSprite.EventType_.BOXSTART,
      mapBrowserEvent.coordinate, mapBrowserEvent))
    return true
  } else {
    return false
  }
}

export default TextSprite
