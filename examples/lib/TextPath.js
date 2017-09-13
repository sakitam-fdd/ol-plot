/**
 * Created by FDD on 2017/9/13.
 * @desc 文本样式扩充
 */

ol.style.TextPath = function (params = {}) {
  this.options = params

  /**
   * 文本是否隐藏
   * @type {string}
   * @private
   */
  this.textOverflow_ = typeof this.options.textOverflow !== 'undefined' ? this.options.textOverflow : 'visible'

  /**
   * 最小宽度
   * @type {*}
   * @private
   */
  this.minWidth_ = this.options.minWidth || 0

  ol.style.Text.call(this, this.options)
}

ol.inherits(ol.style.TextPath, ol.style.Text)

ol.style.TextPath.drawTextPath = function (event) {
  var ctx = event.context
  ctx.save()
  ctx.scale(event.frameState.pixelRatio, event.frameState.pixelRatio)
  ctx.restore()
}

/**
 * 为矢量图层增加新方法
 * @param style
 * @param maxResolution
 */
ol.layer.Vector.prototype.setTextPathStyle = function (style, maxResolution) {
  if (style === null) {
    if (this.textPath_) this.unByKey(this.textPath_)
    this.textPath_ = null
    this.changed()
    return
  }
  if (!this.textPath_) {
    this.textPath_ = this.on('postcompose', ol.style.TextPath.drawTextPath, this)
  }
  if (style === undefined) {
    style = [new ol.style.Style({text: new ol.style.Text()})]
  }
  if (typeof style === 'function') {
    this.textPathStyle_ = style
  } else {
    this.textPathStyle_ = function () {
      return style
    }
  }
  this.changed()
}
