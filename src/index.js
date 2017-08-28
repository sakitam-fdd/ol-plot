/**
 * Created by FDD on 2017/7/21.
 * @desc 军事标绘
 */
import 'core-js/es6/set'
import 'core-js/es6/symbol'
import 'core-js/es6/reflect'
import 'core-js/es6/promise'
import TextSprite from './text/index'
import _CanvasText from './text/CanvasText'
import _TextArea from './text/TextArea'
class olPlot {
  constructor (map) {
    if (map && map instanceof ol.Map) {
      this.map = map
    } else {
      throw new Error('传入的不是地图对象或者为空！')
    }
    this.version = '1.0.0'
    this.textSprite = new TextSprite()
  }

  /**
   * 返回当前版本
   * @returns {string}
   */
  getVersion () {
    return this.version
  }
  static CanvasText = _CanvasText
  static TextArea = _TextArea
}

export default olPlot
