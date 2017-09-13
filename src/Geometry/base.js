const Plot = function (points) {
  this.setPoints(points)
}

Plot.prototype.generate = function () {
}

/**
 * 设置地图对象
 * @param map
 */
Plot.prototype.setMap = function (map) {
  if (map && map instanceof ol.Map) {
    this.map = map
  } else {
    throw new Error('传入的不是地图对象！')
  }
}

/**
 * 获取当前地图对象
 * @returns {ol.Map|*}
 */
Plot.prototype.getMap = function () {
  return this.map
}

/**
 * 判断是否是Plot
 * @returns {boolean}
 */
Plot.prototype.isPlot = function () {
  return true
}

/**
 * 设置坐标点
 * @param value
 */
Plot.prototype.setPoints = function (value) {
  this.points = !value ? [] : value
  if (this.points.length >= 2) {
    this.generate()
  }
}

/**
 * 获取坐标点
 * @returns {Array.<T>}
 */
Plot.prototype.getPoints = function () {
  return this.points.slice(0)
}

/**
 * 获取点数量
 * @returns {Number}
 */
Plot.prototype.getPointCount = function () {
  return this.points.length
}

/**
 * 更新当前坐标
 * @param point
 * @param index
 */
Plot.prototype.updatePoint = function (point, index) {
  if (index >= 0 && index < this.points.length) {
    this.points[index] = point
    this.generate()
  }
}

/**
 * 更新最后一个坐标
 * @param point
 */
Plot.prototype.updateLastPoint = function (point) {
  this.updatePoint(point, this.points.length - 1)
}

/**
 * 结束绘制
 */
Plot.prototype.finishDrawing = function () {
}

export default Plot
