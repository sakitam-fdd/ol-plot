/**
 * Created by FDD on 2017/5/1.
 * @desc 通过json获取样式
 */

ol.style.Factory = function (options) {
  let option = (options && typeof options === 'object') ? options : {}
  let style = new ol.style.Style({})
  if (option['geometry'] && option['geometry'] instanceof ol.geom.Geometry) {
    style.setGeometry(option['geometry'])
  }
  if (option['zIndex'] && typeof option['zIndex'] === 'number') {
    style.setZIndex(option['zIndex'])
  }
  if (option['fill'] && typeof option['fill'] === 'object') {
    style.setFill(this._getFill(option['fill']))
  }
  if (option['image'] && typeof option['image'] === 'object') {
    style.setImage(this._getImage(option['image']))
  }
  if (option['stroke'] && typeof option['stroke'] === 'object') {
    style.setStroke(this._getStroke(option['stroke']))
  }
  if (option['text'] && typeof option['text'] === 'object') {
    style.setText(this._getText(option['text']))
  }
  return style
}

/**
 * 获取规则样式图形
 * @param options
 * @returns {*}
 * @private
 */
ol.style.Factory.prototype._getRegularShape = function (options) {
  try {
    let regularShape = new ol.style.RegularShape({
      fill: (this._getFill(options['fill']) || undefined),
      points: ((typeof options['points'] === 'number') ? options['points'] : 1),
      radius: ((typeof options['radius'] === 'number') ? options['radius'] : undefined),
      radius1: ((typeof options['radius1'] === 'number') ? options['radius1'] : undefined),
      radius2: ((typeof options['radius2'] === 'number') ? options['radius2'] : undefined),
      angle: ((typeof options['angle'] === 'number') ? options['angle'] : 0),
      snapToPixel: ((typeof options['snapToPixel'] === 'boolean') ? options['snapToPixel'] : true),
      stroke: (this._getStroke(options['stroke']) || undefined),
      rotation: ((typeof options['rotation'] === 'number') ? options['rotation'] : 0),
      rotateWithView: ((typeof options['rotateWithView'] === 'boolean') ? options['rotateWithView'] : false),
      atlasManager: (options['atlasManager'] ? options['atlasManager'] : undefined)
    })
    return regularShape
  } catch (e) {
    console.log(e)
  }
}

/**
 * 获取图标样式
 * @param options
 * @returns {*}
 * @private
 */
ol.style.Factory.prototype._getImage = function (options) {
  try {
    let image
    options = options || {}
    if (options['type'] === 'icon') {
      image = this._getIcon(options['image'])
    } else {
      image = this._getRegularShape(options['image'])
    }
    return image
  } catch (e) {
    console.log(e)
  }
}

/**
 * 获取icon
 * @param options
 * @returns {ol.style.Icon}
 * @private
 */
ol.style.Factory.prototype._getIcon = function (options) {
  try {
    options = options || {}
    let icon = new ol.style.Icon({
      anchor: (options['imageAnchor'] ? options['imageAnchor'] : [0.5, 0.5]),
      anchorXUnits: (options['imageAnchorXUnits'] ? options['imageAnchorXUnits'] : 'fraction'),
      anchorYUnits: (options['imageAnchorYUnits'] ? options['imageAnchorYUnits'] : 'fraction'),
      anchorOrigin: (options['imageAnchorOrigin'] ? options['imageAnchorYUnits'] : 'top-left'),
      color: (options['imageColor'] ? options['imageColor'] : undefined),
      crossOrigin: (options['crossOrigin'] ? options['crossOrigin'] : undefined),
      img: (options['img'] ? options['img'] : undefined),
      offset: (options['offset'] && Array.isArray(options['offset']) && options['offset'].length === 2 ? options['offset'] : [0, 0]),
      offsetOrigin: (options['offsetOrigin'] ? options['offsetOrigin'] : 'top-left'),
      scale: ((typeof options['scale'] === 'number') ? options['scale'] : 1),
      snapToPixel: (typeof options['snapToPixel'] === 'boolean' ? options['snapToPixel'] : true),
      rotateWithView: (typeof options['rotateWithView'] === 'boolean' ? options['rotateWithView'] : false),
      opacity: (typeof options['imageOpacity'] === 'number' ? options['imageOpacity'] : 1),
      rotation: (typeof options['imageRotation'] === 'number' ? options['imageRotation'] : 0),
      size: (options['size'] && Array.isArray(options['size']) && options['size'].length === 2 ? options['size'] : undefined),
      imgSize: (options['imgSize'] && Array.isArray(options['imgSize']) && options['imgSize'].length === 2 ? options['imgSize'] : undefined),
      src: (options['imageSrc'] ? options['imageSrc'] : undefined)
    })
    return icon
  } catch (error) {
    console.log(error)
  }
}
/**
 * 获取线条样式
 * @param options
 * @returns {ol.style.Stroke}
 * @private
 */
ol.style.Factory.prototype._getStroke = function (options) {
  try {
    options = options || {}
    let stroke = new ol.style.Stroke({
      color: (options['strokeColor'] ? options['strokeColor'] : undefined),
      lineCap: ((options['strokeLineCap'] && typeof options['strokeLineCap'] === 'string') ? options['strokeLineCap'] : 'round'),
      lineJoin: ((options['strokeLineJoin'] && typeof options['strokeLineJoin'] === 'string') ? options['strokeLineJoin'] : 'round'),
      lineDash: (options['strokeLineDash'] ? options['strokeLineDash'] : undefined),
      lineDashOffset: (typeof options['strokeLineDashOffset'] === 'number' ? options['strokeLineDashOffset'] : '0'),
      miterLimit: (typeof options['strokeMiterLimit'] === 'number' ? options['strokeMiterLimit'] : 10),
      width: (typeof options['strokeWidth'] === 'number' ? options['strokeWidth'] : undefined)
    })
    return stroke
  } catch (error) {
    console.log(error)
  }
}

/**
 * 获取样式文本
 * @param options
 * @returns {ol.style.Text}
 * @private
 */
ol.style.Factory.prototype._getText = function (options) {
  try {
    let text = new ol.style.Text({
      font: ((options['textFont'] && typeof options['textFont'] === 'string') ? options['textFont'] : '10px sans-serif'),
      offsetX: (typeof options['textOffsetX'] === 'number' ? options['textOffsetX'] : 0),
      offsetY: (typeof options['textOffsetY'] === 'number' ? options['textOffsetY'] : 0),
      scale: (typeof options['textScale'] === 'number' ? options['textScale'] : undefined),
      rotation: (typeof options['textRotation'] === 'number' ? options['textRotation'] : 0),
      text: ((options['text'] && typeof options['text'] === 'string') ? options['text'] : undefined),
      textAlign: ((options['textAlign'] && typeof options['textAlign'] === 'string') ? options['textAlign'] : 'start'),
      textBaseline: ((options['textBaseline'] && typeof options['textBaseline'] === 'string') ? options['textBaseline'] : 'alphabetic'),
      rotateWithView: (typeof options['rotateWithView'] === 'boolean' ? options['rotateWithView'] : false),
      fill: this._getFill(options['textFill']),
      stroke: this._getStroke(options['textStroke'])
    })
    return text
  } catch (error) {
    console.log(error)
  }
}

/**
 * 获取填充颜色
 * @param options
 * @returns {ol.style.Fill}
 * @private
 */
ol.style.Factory.prototype._getFill = function (options) {
  try {
    options = options || {}
    let fill = new ol.style.Fill({
      color: (options['fillColor'] ? options['fillColor'] : undefined)
    })
    return fill
  } catch (error) {
    console.log(error)
  }
}

let olStyleFactory = ol.style.Factory
export default olStyleFactory
