/**
 * @classdesc
 * Layer source for the OpenStreetMap tile server.
 * @constructor
 * @extends {ol.source.XYZ}
 * @param {olx.source.OSMOptions=} optOptions Open Street Map options.
 * @api
 */
ol.source.GAODE = function (optOptions) {
  let options = optOptions || {}
  let attributions = ''
  if (options.attributions !== undefined) {
    attributions = options.attributions
  } else {
    attributions = [ol.source.GAODE.ATTRIBUTION]
  }
  let crossOrigin = options.crossOrigin !== undefined ? options.crossOrigin : 'anonymous'
  let url = options.url !== undefined ? options.url : 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}'

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
ol.inherits(ol.source.GAODE, ol.source.XYZ)

/**
 * The attribution containing a link to the OpenStreetMap Copyright and License
 * page.
 * @const
 * @type {ol.Attribution}
 * @api
 */
ol.source.GAODE.ATTRIBUTION = new ol.Attribution({
  html: '&copy; ' +
  '<a href="http://ditu.amap.com/">高德地图</a> ' +
  'contributors.'
})
