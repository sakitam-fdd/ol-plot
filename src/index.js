/**
 * Created by FDD on 2017/7/21.
 * @desc 军事标绘
 */
import TextSprite from './text/index'
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
}

export default olPlot
