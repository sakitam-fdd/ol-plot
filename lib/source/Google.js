/**
 * @classdesc
 * Layer source for the OpenStreetMap tile server.
 * @constructor
 * @extends {ol.source.XYZ}
 * @param {olx.source.OSMOptions=} optOptions Open Street Map options.
 * @api
 */
ol.source.GOOGLE = function (optOptions) {
  var options = optOptions || {}
  var attributions = ''
  if (options.attributions !== undefined) {
    attributions = options.attributions
  } else {
    attributions = [ol.source.GOOGLE.ATTRIBUTION]
  }
  var crossOrigin = options.crossOrigin !== undefined ? options.crossOrigin : 'anonymous'
  var url = options.url !== undefined ? options.url : 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}'

  ol.source.XYZ.call(this, {
    attributions: attributions,
    cacheSize: options.cacheSize,
    crossOrigin: crossOrigin,
    opaque: options.opaque !== undefined ? options.opaque : true,
    maxZoom: options.maxZoom !== undefined ? options.maxZoom : 19,
    reprojectionErrorThreshold: options.reprojectionErrorThreshold,
    tileLoadFunction: options.tileLoadFunction,
    url: url,
    wrapX: options.wrapX
  })
}
ol.inherits(ol.source.GOOGLE, ol.source.XYZ)

/**
 * The attribution containing a link to the OpenStreetMap Copyright and License
 * page.
 * @const
 * @type {ol.Attribution}
 * @api
 */
ol.source.GOOGLE.ATTRIBUTION = new ol.Attribution({
  html: '&copy; ' +
  '<a href="http://www.google.cn/maps">谷歌地图</a> ' +
  'contributors.'
})
