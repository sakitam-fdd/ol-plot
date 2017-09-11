/**
 * @classdesc
 * Layer source for the OpenStreetMap tile server.
 * @constructor
 * @extends {ol.source.XYZ}
 * @param {olx.source.OSMOptions=} optOptions Open Street Map options.
 * @api
 */
ol.source.BAIDU = function (optOptions) {
  var options = optOptions || {}
  var attributions = ''
  if (options.attributions !== undefined) {
    attributions = options.attributions
  } else {
    attributions = [ol.source.BAIDU.ATTRIBUTION]
  }
  options.projection = options['projection'] ? options.projection : 'EPSG:3857'
  var crossOrigin = options.crossOrigin !== undefined ? options.crossOrigin : 'anonymous'
  var url = options.url !== undefined ? options.url : 'http://online{0-3}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20170607&scaler=1&p=1'
  var tileUrlFunction = options.tileUrlFunction ? options.tileUrlFunction : undefined
  if (!tileUrlFunction) {
    tileUrlFunction = function (tileCoord) {
      var z = tileCoord[0]
      var x = tileCoord[1]
      var y = tileCoord[2]
      if (x < 0) {
        x = 'M' + (-x)
      }
      if (y < 0) {
        y = 'M' + (-y)
      }
      return url.replace('{0-3}', ol.source.BAIDU.getRandom(0, 3)).replace('{x}', (x).toString()).replace('{y}', y.toString()).replace('{z}', (z).toString())
    }
  }
  var levels = options['levels'] ? options['levels'] : 19
  var resolutions = []
  for (var z = 0; z < levels; z++) {
    resolutions[z] = Math.pow(2, levels - 1 - z)
  }
  var tileGrid = new ol.tilegrid.TileGrid({
    tileSize: options['tileSize'] ? options['tileSize'] : 256,
    origin: (options['origin'] ? options['origin'] : [0, 0]),
    extent: (options['extent'] ? options['extent'] : undefined),
    resolutions: resolutions,
    minZoom: ((options['minZoom'] && typeof options['minZoom'] === 'number') ? options['minZoom'] : 0)
  })
  ol.source.TileImage.call(this, {
    tileGrid: tileGrid,
    attributions: attributions,
    cacheSize: options.cacheSize,
    projection: options.projection,
    crossOrigin: crossOrigin,
    opaque: options.opaque !== undefined ? options.opaque : true,
    maxZoom: options.maxZoom !== undefined ? options.maxZoom : 19,
    reprojectionErrorThreshold: options.reprojectionErrorThreshold,
    tileUrlFunction: tileUrlFunction,
    url: url,
    wrapX: options.wrapX
  })
}
ol.inherits(ol.source.BAIDU, ol.source.TileImage)

/**
 * 获取随机服务器
 * @param min
 * @param max
 * @returns {number}
 */
ol.source.BAIDU.getRandom = function (min, max) {
  var r = Math.random() * (max - min)
  var re = Math.round(r + min)
  re = Math.max(Math.min(re, max), min)
  return re
}

/**
 * The attribution containing a link to the OpenStreetMap Copyright and License
 * page.
 * @const
 * @type {ol.Attribution}
 * @api
 */
ol.source.BAIDU.ATTRIBUTION = new ol.Attribution({
  html: '&copy; ' +
  '<a href="http://map.baidu.com/">百度地图</a> ' +
  'contributors.'
})
