/**
 * Created by FDD on 2017/8/28.
 * @desc 采用文本框转换为canvas叠加到画布
 */
import Observable from 'observable-emit'
import mixin from '../utils/mixins'
import SvgToImage from 'svg-to-image'
import GetContext from 'get-canvas-context'
import html2canvas from 'html2canvas'
class TextArea extends mixin(Observable) {
  constructor (data, params) {
    super()
    this.options = params || {}
    this.data = data || ''
    Observable.call(this)
  }

  /**
   * 获取dom canvas
   */
  getCanvas () {
    try {
      let canvas_ = null
      if (this.data && typeof this.data === 'string') {
        SvgToImage(this.data, (err, image) => {
          if (err) throw err
          let context = GetContext('2d', {
            width: typeof this.options['width'] === 'number' ? this.options['width'] : 100,
            height: typeof this.options['width'] === 'number' ? this.options['width'] : 100
          })
          canvas_ = new Promise((resolve) => {
            resolve(context.drawImage(image, 0, 0))
          })
        })
      } else {
        canvas_ = html2canvas(this.data)
      }
      return canvas_
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * 获取dom image
   * @returns {*}
   */
  getImage () {
    try {
      let image_ = null
      if (this.data && typeof this.data === 'string') {
        SvgToImage(this.data, (err, image) => {
          if (err) throw err
          image_ = new Promise((resolve) => {
            resolve(image)
          })
        })
      } else {
        image_ = html2canvas(this.data).then(canvas => {
          let _image = new Image()
          _image.src = canvas.toDataURL('image/png')
          return new Promise((resolve) => {
            resolve(_image)
          })
        }).catch(error => {
          console.info(error)
        })
      }
      return image_
    } catch (error) {
      console.log(error)
    }
  }
}

export default TextArea
