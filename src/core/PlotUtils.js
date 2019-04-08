/**
 * Created by FDD on 2017/9/12.
 * @desc 标绘相关工具（包含样式修改获取和标绘保存和恢复）
 */
import { Map } from 'ol'
import {
  Style, Icon,
  RegularShape
} from 'ol/style'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { asArray, asString } from 'ol/color'
import { Point } from 'ol/geom'
import { getSize, getBottomLeft, getTopRight, buffer } from 'ol/extent'

import Feature from 'ol/Feature'

import olStyleFactory from '../Utils/factory'
import PlotTextBox from '../Geometry/Text/PlotTextBox'
import * as Geometry from '../Geometry'
import { createVectorLayer, getLayerByLayerName } from '../Utils/layerUtils'
import { BASE_LAYERNAME } from '../Constants'
class PlotUtils {
  constructor (map, options) {
    if (map && map instanceof Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象！')
    }

    this.options = options
    this.layerName = ((this.options && this.options['layerName']) ? this.options['layerName'] : BASE_LAYERNAME)
  }

  /**
   * 获取样式信息
   * @param feature
   * @returns {boolean}
   */
  getBaseStyle (feature) {
    let style = feature.getStyle()
    if (!style) {
      let layer = getLayerByLayerName(this.map, this.layerName)
      if (layer && layer instanceof VectorLayer) {
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
      if (feature && feature instanceof Feature) {
        let style = this.getBaseStyle(feature)
        let tempStyle = style.clone()
        let _image = this._getImage(image)
        if (_image) {
          tempStyle.setImage(_image)
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
      if (feature && feature instanceof Feature) {
        let style = this.getBaseStyle(feature)
        let tempStyle = style.clone()
        let fill = tempStyle.getFill()
        let color = fill.getColor()
        if (color) {
          let tempColor = asArray(color)
          let _color = asArray(backgroundColor)
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
      if (feature && feature instanceof Feature) {
        let style = this.getBaseStyle(feature)
        if (style) {
          let tempStyle = style.clone()
          let fill = tempStyle.getFill()
          let color = fill.getColor()
          if (color) {
            let tempColor = asArray(color)
            tempColor[3] = opacity
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
      if (feature && feature instanceof Feature) {
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
      if (feature && feature instanceof Feature) {
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
      let tempColor = asArray(color)
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
      let colorTarget = asArray(color)
      return (asString(colorTarget))
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
        if (olStyle_ instanceof Icon) {
          image['type'] = 'icon'
          image['image'] = {}
          image['image']['imageAnchor'] = olStyle_.getAnchor()
          image['image']['imageColor'] = olStyle_.getColor()
          image['image']['imageSrc'] = olStyle_.getSrc()
          image['image']['imgSize'] = olStyle_.getSize()
          image['image']['scale'] = olStyle_.getScale()
          image['image']['imageRotation'] = olStyle_.getRotation()
          image['image']['rotateWithView'] = olStyle_.getRotateWithView()
          image['image']['imageOpacity'] = olStyle_.getOpacity()
          image['image']['snapToPixel'] = olStyle_.getSnapToPixel()
          image['image']['offset'] = olStyle_.getOrigin()
        } else if (olStyle_ instanceof RegularShape) {
          image['type'] = ''
          image['image'] = {}
          image['image']['fill'] = this.getFill_(olStyle_)
          image['image']['points'] = olStyle_.getPoints()
          image['image']['radius'] = olStyle_.getRadius()
          image['image']['radius2'] = olStyle_.getRadius2()
          image['image']['angle'] = olStyle_.getAngle()
          image['image']['stroke'] = this.getStroke_(olStyle_)
          image['image']['rotateWithView'] = olStyle_.getRotateWithView()
          image['image']['snapToPixel'] = olStyle_.getSnapToPixel()
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
      if (feature && feature instanceof Feature) {
        let style = this.getBaseStyle(feature)
        if (style && style instanceof Style) {
          // 填充颜色
          let fill = this.getFill_(style)
          let [opacity, rgbaArray, backgroundColor] = [1, null]
          if (fill && fill['fillColor']) {
            rgbaArray = asArray(fill['fillColor'])
            opacity = parseFloat(rgbaArray[3])
            if (rgbaArray && typeof opacity === 'number') {
              backgroundColor = this.handleBackgroundColor(asString(rgbaArray), opacity)
            }
          }
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
   * 移除图层上所有的数据
   */
  removeAllFeatures () {
    const layer = getLayerByLayerName(this.map, this.layerName)
    const overlays_ = this.map.getOverlays().getArray()
    if (layer) {
      let source = layer.getSource()
      source.clear()
    }
    if (overlays_ && overlays_.length > 0) {
      let len = overlays_.length
      for (let i = 0; i < len; i++) {
        if (overlays_[i] && overlays_[i].get('isPlotText')) {
          this.map.removeOverlay(overlays_[i])
          i--
        }
      }
    }
  }

  /**
   * 获取所有的要素包含样式信息的GeoJSON
   * @returns {Array}
   */
  getFeatures () {
    let rFeatures = []
    let layer = getLayerByLayerName(this.map, this.layerName)
    if (layer) {
      let source = layer.getSource()
      if (source && source instanceof VectorSource) {
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
                    'type': feature.getGeometry().getPlotType(),
                    'style': this.getStyleCode(feature),
                    'points': feature.getGeometry().getPoints()
                  }
                })
              }
            }
          })
        }
      }
    }
    const overlays_ = this.map.getOverlays().getArray()
    overlays_.forEach(overlay => {
      if (overlay.get('isPlotText')) {
        const style_ = overlay.getStyle()
        style_['width'] = overlay.getWidth() + 'px'
        style_['height'] = overlay.getHeight() + 'px'
        rFeatures.push({
          'type': 'Feature',
          'geometry': {
            'type': 'PlotText',
            'coordinates': overlay.getPosition()
          },
          'properties': {
            'id': overlay.getId(),
            'width': overlay.getWidth(),
            'height': overlay.getHeight(),
            'style': style_,
            'value': overlay.getValue()
          }
        })
      }
    })
    return rFeatures
  }

  /**
   * 恢复相关标绘
   * @param features
   */
  addFeatures (features) {
    if (features && Array.isArray(features) && features.length > 0) {
      let layer = getLayerByLayerName(this.map, this.layerName)
      if (!layer) {
        layer = createVectorLayer(this.map, this.layerName, {
          create: true
        })
        layer.setZIndex(this.options['zIndex'] || 99)
      }
      if (layer) {
        let source = layer.getSource()
        if (source && source instanceof VectorSource) {
          const _extents = []
          features.forEach(feature => {
            if (feature && feature['geometry'] && feature['geometry']['type'] !== 'PlotText') {
              if (feature['properties']['type'] && Geometry[feature['properties']['type']]) {
                let feat = new Feature({
                  geometry: (new Geometry[feature['properties']['type']]([], feature['properties']['points'], feature['properties']))
                })
                feat.set('isPlot', true)
                _extents.push(feat.getGeometry().getExtent())
                if (feature['properties']['style']) {
                  /* eslint new-cap: 0 */
                  let style_ = new olStyleFactory(feature['properties']['style'])
                  if (style_) {
                    feat.setStyle(style_)
                  }
                }
                source.addFeature(feat)
              } else {
                console.warn('不存在的标绘类型！')
              }
            } else if (feature && feature['geometry'] && feature['geometry']['type'] === 'PlotText') {
              _extents.push((new Point(feature.geometry['coordinates'])).getExtent())
              const _plotText = new PlotTextBox({
                id: feature.properties.id,
                position: feature.geometry['coordinates'],
                width: feature.properties['width'],
                height: feature.properties['height'],
                value: feature.properties['value'],
                style: feature.properties.style
              })
              if (this.map && this.map instanceof Map && _plotText) {
                this.map.addOverlay(_plotText)
              } else {
                console.warn('未传入地图对象或者plotText创建失败！')
              }
            }
          })
          if (this.options['zoomToExtent'] && _extents && _extents.length > 0) {
            const _extent = this._getExtent(_extents)
            const size = this.map.getSize()
            const _view = this.map.getView()
            _view.fit(_extent, {
              size: size,
              duration: 800,
              maxZoom: (_view.getMaxZoom() || undefined)
            })
          }
        }
      }
    }
  }

  /**
   * get extent
   * @private
   */
  _getExtent (extents, params = {}) {
    const bbox = [ Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]
    let _extent = extents.reduce(function (prev, coord) {
      return [
        Math.min(coord[0], prev[0]),
        Math.min(coord[1], prev[1]),
        Math.max(coord[2], prev[2]),
        Math.max(coord[3], prev[3])
      ]
    }, bbox)
    let size = getSize(_extent)
    let adjust = typeof params['adjust'] === 'number' ? params['adjust'] : 0.2
    let minWidth = typeof params['minWidth'] === 'number' ? params['minWidth'] : 0.05
    let minHeight = typeof params['minHeight'] === 'number' ? params['minHeight'] : 0.05
    if (size[0] <= minWidth || size[1] <= minHeight) {
      let bleft = getBottomLeft(_extent) // 获取xmin,ymin
      let tright = getTopRight(_extent) // 获取xmax,ymax
      let xmin = bleft[0] - adjust
      let ymin = bleft[1] - adjust
      let xmax = tright[0] + adjust
      let ymax = tright[1] + adjust
      _extent = buffer([xmin, ymin, xmax, ymax], adjust)
    }
    return _extent
  }
}
export default PlotUtils
