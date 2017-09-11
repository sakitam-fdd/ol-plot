/**
 * 获取回填样式
 * @param feat
 * @returns {*}
 */
export const getStyle = (feat) => {
  try {
    let style = feat.getStyle()
    if (!style) {
      let layer = config.Maps.getLayerByLayerName(config.tempLayer.plotDrawLayer)
      if (layer && layer instanceof ol.layer.Vector) {
        style = layer.getStyle()
      } else {
        return false
      }
    }
    if (style && style instanceof ol.style.Style) {
      // 面透明度
      let color = style.getFill()
      if (color && color.getColor) {
        let rgba = color.getColor()
        if (rgba) {
          let opacity = 1
          if (Array.isArray(rgba)) {
            opacity = parseFloat(rgba[3])
          } else {
            opacity = parseFloat(rgba.split(',')[3])
          }
          // 填充颜色
          let backgroundColor = handleBackgroundColor(rgba, opacity)
          let [borderColor, borderWidth] = ['', '']
          if (style.getStroke && style.getStroke()) {
            // 边框线颜色
            if (style.getStroke().getColor && style.getStroke().getColor()) {
              borderColor = getColor(style.getStroke().getColor())
            }
            // 边框线宽度
            if (style.getStroke().getWidth()) {
              borderWidth = style.getStroke().getWidth()
            }
          }
          return {
            backgroundColor: backgroundColor,
            opacity: opacity * 10,
            borderColor: borderColor,
            borderWidth: borderWidth
          }
        }
      }
    }
  } catch (e) {
    console.warn(e)
  }
}
/**
 * 格式化获取的样式
 * @param color
 * @returns {string}
 */
export const getColor = color => {
  try {
    let colorTarget = ol.color.asArray(color)
    colorTarget[3] = 1
    return ol.color.asString(colorTarget)
  } catch (e) {
    console.warn(e)
  }
}

/**
 * 处理背景颜色（背景颜色是和透明度组合得到的）
 * @param color
 * @param opacity
 * @returns {string}
 */
export const handleBackgroundColor = (color, opacity) => {
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
 * 设置边框宽度
 * @param borderWidth
 */
export const setBorderWidth = borderWidth => {
  try {
    if (config.Maps.plotEdit.activePlot) {
      let style = config.Maps.plotEdit.activePlot.getStyle()
      if (!style) {
        let layer = config.Maps.getLayerByLayerName(config.tempLayer.plotDrawLayer)
        if (layer && layer instanceof ol.layer.Vector) {
          style = layer.getStyle()
        } else {
          return false
        }
      }
      let tempStyle = style.clone()
      let stroke = tempStyle.getStroke()
      stroke.setWidth(borderWidth)
      config.Maps.plotEdit.activePlot.setStyle(tempStyle)
    }
  } catch (e) {
    console.warn(e)
  }
}
/**
 * 设置边框颜色
 * @param borderColor
 */
export const setBorderColor = borderColor => {
  try {
    if (config.Maps.plotEdit.activePlot) {
      let style = config.Maps.plotEdit.activePlot.getStyle()
      if (!style) {
        style = config.Maps.getLayer(config.tempLayer.plotDrawLayer).getStyle()
      }
      let tempStyle = style.clone()
      let stroke = tempStyle.getStroke()
      stroke.setColor(borderColor)
      config.Maps.plotEdit.activePlot.setStyle(tempStyle)
    }
  } catch (e) {
    console.warn(e)
  }
}
/**
 * 设置透明度
 * @param opacity
 */
export const setOpacity = opacity => {
  try {
    if (config.Maps.plotEdit.activePlot) {
      let style = config.Maps.plotEdit.activePlot.getStyle()
      if (!style) {
        let layer = config.Maps.getLayerByLayerName(config.tempLayer.plotDrawLayer)
        if (layer && layer instanceof ol.layer.Vector) {
          style = layer.getStyle()
        } else {
          return false
        }
      }
      if (style) {
        let tempStyle = style.clone()
        let fill = tempStyle.getFill()
        let color = fill.getColor()
        if (color) {
          let tempColor = ol.color.asArray(color)
          tempColor[3] = opacity / 10
          let currentColor = 'rgba(' + tempColor.join(',') + ')'
          fill.setColor(currentColor)
          config.Maps.plotEdit.activePlot.setStyle(tempStyle)
        }
      }
    }
  } catch (e) {
    console.warn(e)
  }
}
/**
 * 设置背景颜色
 * @param backgroundColor
 */
export const setBackgroundColor = backgroundColor => {
  try {
    if (config.Maps.plotEdit.activePlot) {
      let style = config.Maps.plotEdit.activePlot.getStyle()
      if (!style) {
        let layer = config.Maps.getLayerByLayerName(config.tempLayer.plotDrawLayer)
        if (layer && layer instanceof ol.layer.Vector) {
          style = layer.getStyle()
        } else {
          return false
        }
      }
      let tempStyle = style.clone()
      let fill = tempStyle.getFill()
      let color = fill.getColor()
      if (color) {
        let tempColor = ol.color.asArray(color)
        let _color = ol.color.asArray(backgroundColor)
        let currentColor = handleBackgroundColor(_color, tempColor[3])
        fill.setColor(currentColor)
        config.Maps.plotEdit.activePlot.setStyle(tempStyle)
      }
    }
  } catch (e) {
    console.warn(e)
  }
}
