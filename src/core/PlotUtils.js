/**
 * Created by FDD on 2017/9/12.
 * @desc 标绘相关工具（包含样式修改获取和标绘保存和恢复）
 */
import olLayerLayerUtils from '../Utils/layerUtils'
import olStyleFactory from '../Utils/factory'
import mixin from '../Utils/mixin'
import { BASE_LAYERNAME } from '../Constants'
class PlotUtils extends mixin(olLayerLayerUtils, olStyleFactory) {
  constructor (map, layerName) {
    super()
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }
    this.layerName = layerName || BASE_LAYERNAME
  }

  /**
   * 获取样式信息
   * @param feature
   * @returns {boolean}
   */
  getBaseStyle (feature) {
    let style = feature.getStyle()
    if (!style) {
      let layer = this.getLayerByLayerName(this.layerName)
      if (layer && layer instanceof ol.layer.Vector) {
        style = layer.getStyle()
      } else {
        return false
      }
    }
    return style
  }

  /**
   * 设置点类型的图标样式
   * @param feature
   * @param image
   */
  setIcon (feature, image) {
    try {
      if (feature && feature instanceof ol.Feature) {
        let style = this.getBaseStyle(feature)
        let tempStyle = style.clone()
        let image = this._getImage(image)
        if (image) {
          tempStyle.setImage(image)
          feature.setStyle(tempStyle)
        }
      }
    } catch (e) {
      console.warn(e)
    }
  }

  /**
   * 设置背景颜色
   * @param feature
   * @param backgroundColor
   * @returns {boolean}
   */
  setBackgroundColor (feature, backgroundColor) {
    try {
      if (feature && feature instanceof ol.Feature) {
        let style = this.getBaseStyle(feature)
        let tempStyle = style.clone()
        let fill = tempStyle.getFill()
        let color = fill.getColor()
        if (color) {
          let tempColor = ol.color.asArray(color)
          let _color = ol.color.asArray(backgroundColor)
          let currentColor = this.handleBackgroundColor(_color, tempColor[3])
          fill.setColor(currentColor)
          feature.setStyle(tempStyle)
        }
      }
    } catch (e) {
      console.warn(e)
    }
  }

  /**
   * 设置透明度
   * @param feature
   * @param opacity
   */
  setOpacity (feature, opacity) {
    try {
      if (feature && feature instanceof ol.Feature) {
        let style = this.getBaseStyle(feature)
        if (style) {
          let tempStyle = style.clone()
          let fill = tempStyle.getFill()
          let color = fill.getColor()
          if (color) {
            let tempColor = ol.color.asArray(color)
            tempColor[3] = opacity / 10
            let currentColor = 'rgba(' + tempColor.join(',') + ')'
            fill.setColor(currentColor)
            feature.setStyle(tempStyle)
          }
        }
      }
    } catch (e) {
      console.warn(e)
    }
  }

  /**
   * 设置边框颜色
   * @param feature
   * @param borderColor
   */
  setBorderColor (feature, borderColor) {
    try {
      if (feature && feature instanceof ol.Feature) {
        let style = this.getBaseStyle(feature)
        let tempStyle = style.clone()
        let stroke = tempStyle.getStroke()
        stroke.setColor(borderColor)
        feature.setStyle(tempStyle)
      }
    } catch (e) {
      console.warn(e)
    }
  }

  /**
   * 设置边框宽度
   * @param feature
   * @param borderWidth
   */
  setBorderWidth (feature, borderWidth) {
    try {
      if (feature && feature instanceof ol.Feature) {
        let style = this.getBaseStyle(feature)
        let tempStyle = style.clone()
        let stroke = tempStyle.getStroke()
        stroke.setWidth(borderWidth)
        feature.setStyle(tempStyle)
      }
    } catch (e) {
      console.warn(e)
    }
  }

  /**
   * 处理背景色
   * @param color
   * @param opacity
   * @returns {string}
   */
  handleBackgroundColor (color, opacity) {
    try {
      if (!opacity) opacity = 1
      let tempColor = ol.color.asArray(color)
      tempColor[3] = opacity
      return ('rgba(' + tempColor.join(',') + ')')
    } catch (e) {
      console.warn(e)
    }
  }

  /**
   * 获取颜色值
   * @param color
   * @returns {string}
   */
  getColor (color) {
    try {
      let colorTarget = ol.color.asArray(color)
      return (ol.color.asString(colorTarget))
    } catch (e) {
      console.warn(e)
    }
  }

  /**
   * 去除无值的字段
   * @param obj
   * @returns {*}
   */
  fixObject (obj) {
    if (obj && typeof obj === 'object') {
      for (let key in obj) {
        if (key && typeof obj[key] === 'undefined') {
          delete obj[key]
        }
      }
    }
    return obj
  }

  /**
   * 获取stroke
   * @param style
   * @returns {*}
   */
  getStroke_ (style) {
    let stroke = null
    if (style) {
      let olStyle_ = style.getStroke()
      if (olStyle_) {
        stroke = {}
        stroke['strokeColor'] = this.getColor(olStyle_.getColor())
        stroke['strokeWidth'] = olStyle_.getWidth()
        stroke['strokeLineDash'] = olStyle_.getLineDash()
        stroke['lineDashOffset'] = olStyle_.getLineDashOffset()
        stroke['strokeLineCap'] = olStyle_.getLineCap()
        stroke['strokeLineJoin'] = olStyle_.getLineJoin()
        stroke['strokeMiterLimit'] = olStyle_.getMiterLimit()
      }
    }
    return this.fixObject(stroke)
  }

  /**
   * 获取填充色
   * @param style
   * @returns {*}
   * @private
   */
  getFill_ (style) {
    let fill = null
    if (style) {
      let olStyle_ = style.getFill()
      if (olStyle_) {
        fill = {}
        let color = olStyle_.getColor()
        fill['fillColor'] = this.getColor(color)
      }
    }
    return this.fixObject(fill)
  }

  /**
   * 获取文本信息
   * @param style
   * @returns {*}
   * @private
   */
  getText_ (style) {
    let text = null
    if (style) {
      let olStyle_ = style.getText()
      if (olStyle_) {
        text = {}
        text['textFont'] = olStyle_.getFont()
        text['textOffsetX'] = olStyle_.getOffsetX()
        text['textOffsetY'] = olStyle_.getOffsetY()
        text['textScale'] = olStyle_.getScale()
        text['textRotation'] = olStyle_.getRotation()
        text['text'] = olStyle_.getText()
        text['textAlign'] = olStyle_.getTextAlign()
        text['textBaseline'] = olStyle_.getTextBaseline()
        text['rotateWithView'] = olStyle_.getRotateWithView()
        text['textFill'] = this.getFill_(olStyle_)
        text['textStroke'] = this.getStroke_(olStyle_)
      }
    }
    return this.fixObject(text)
  }

  /**
   * 获取图像信息
   * @param style
   * @returns {*}
   * @private
   */
  getImage_ (style) {
    let image = null
    if (style) {
      let olStyle_ = style.getImage()
      if (olStyle_) {
        image = {}
        if (olStyle_ instanceof ol.style.Icon) {
          image['type'] = 'icon'
          image['image'] = {}
          image['imageAnchor'] = olStyle_.getAnchor()
          image['imageColor'] = olStyle_.getColor()
          image['imageSrc'] = olStyle_.getSrc()
          image['imgSize'] = olStyle_.getSize()
          image['scale'] = olStyle_.getScale()
          image['imageRotation'] = olStyle_.getRotation()
          image['rotateWithView'] = olStyle_.getRotateWithView()
          image['imageOpacity'] = olStyle_.getOpacity()
          image['snapToPixel'] = olStyle_.getSnapToPixel()
          image['offset'] = olStyle_.getOrigin()
        } else if (olStyle_ instanceof ol.style.RegularShape) {
          image['type'] = ''
          image['image'] = {}
          image['fill'] = this.getFill_(olStyle_)
          image['points'] = olStyle_.getPoints()
          image['radius'] = olStyle_.getRadius()
          image['radius2'] = olStyle_.getRadius2()
          image['angle'] = olStyle_.getAngle()
          image['stroke'] = this.getStroke_(olStyle_)
          image['rotateWithView'] = olStyle_.getRotateWithView()
          image['snapToPixel'] = olStyle_.getSnapToPixel()
        }
      }
    }
    return this.fixObject(image)
  }

  /**
   * 获取样式配置
   * @param feature
   * @returns {{fill: {fillColor: string, opacity: number}, stroke: *, image: *, text: *}}
   */
  getStyleCode (feature) {
    try {
      if (feature && feature instanceof ol.Feature) {
        let style = this.getBaseStyle(feature)
        if (style && style instanceof ol.style.Style) {
          // 填充颜色
          let fill = this.getFill_(style)
          let [opacity, rgbaArray] = [1, null]
          if (fill['fillColor']) {
            rgbaArray = ol.color.asArray(fill['fillColor'])
            opacity = parseFloat(rgbaArray[3])
          }
          let backgroundColor = this.handleBackgroundColor(ol.color.asString(rgbaArray), opacity)
          // 边框线条
          let stroke = this.getStroke_(style)
          // 文本信息
          let text = this.getText_(style)
          // 获取icon
          let icon = this.getImage_(style)
          return {
            fill: {
              fillColor: backgroundColor,
              opacity: opacity
            },
            stroke: stroke,
            image: icon,
            text: text
          }
        }
      }
    } catch (e) {
      console.warn(e)
    }
  }

  /**
   * 获取所有的要素包含样式信息的GeoJSON
   * @returns {Array}
   */
  getFeatures () {
    let rFeatures = []
    let layer = this.getLayerByLayerName(this.layerName)
    if (layer) {
      let source = layer.getSource()
      if (source && source instanceof ol.source.Vector) {
        let features = source.getFeatures()
        if (features && features.length > 0) {
          features.forEach((feature, index) => {
            if (feature && feature.getGeometry) {
              let geom = feature.getGeometry()
              if (geom && geom.getCoordinates) {
                let type = geom.getType()
                let coordinates = geom.getCoordinates()
                rFeatures.push({
                  'type': 'Feature',
                  'geometry': {
                    'type': type,
                    'coordinates': coordinates
                  },
                  'properties': {
                    'style': this.getStyleCode(feature)
                  }
                })
              }
            }
          })
        }
      }
    }
    return rFeatures
  }
}

export default PlotUtils
