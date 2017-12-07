/**
 * Created by FDD on 2017/10/24.
 */
const externals = function (context, request, callback) {
  if (/^(ol\/|openlayers\/)\S*$/.test(request)) {
    if (/^(ol\/map|openlayers\/map)$/.test(request)) {
      return callback(null, 'root ' + 'ol.Map')
    } else if (/^(ol\/view|openlayers\/view)$/.test(request)) {
      return callback(null, 'root ' + 'ol.View')
    } else if (/^(ol\/layer\/tile|openlayers\/layer\/tile)$/.test(request)) {
      return callback(null, 'root ' + 'ol.layer.Tile')
    } else if (/^(ol\/layer\/vector|openlayers\/layer\/vector)$/.test(request)) {
      return callback(null, 'root ' + 'ol.layer.Vector')
    } else if (/^(ol\/layer\/group|openlayers\/layer\/group)$/.test(request)) {
      return callback(null, 'root ' + 'ol.layer.Group')
    } else if (/^(ol\/source\/group|openlayers\/source\/group)$/.test(request)) {
      return callback(null, 'root ' + 'ol.source.Group')
    } else if (/^(ol\/source\/vector|openlayers\/source\/vector)$/.test(request)) {
      return callback(null, 'root ' + 'ol.source.Vector')
    } else if (/^(ol\/source\/osm|openlayers\/source\/osm)$/.test(request)) {
      return callback(null, 'root ' + 'ol.source.OSM')
    } else if (/^(ol\/proj|openlayers\/proj)$/.test(request)) {
      return callback(null, 'root ' + 'ol.proj')
    } else if (/^(ol\/style\/style|openlayers\/style\/style)$/.test(request)) {
      return callback(null, 'root ' + 'ol.style.Style')
    } else if (/^(ol\/style\/regularshape|openlayers\/style\/regularshape)$/.test(request)) {
      return callback(null, 'root ' + 'ol.style.RegularShape')
    } else if (/^(ol\/style\/icon|openlayers\/style\/icon)$/.test(request)) {
      return callback(null, 'root ' + 'ol.style.Icon')
    } else if (/^(ol\/style\/stroke|openlayers\/style\/stroke)$/.test(request)) {
      return callback(null, 'root ' + 'ol.style.Stroke')
    } else if (/^(ol\/style\/text|openlayers\/style\/text)$/.test(request)) {
      return callback(null, 'root ' + 'ol.style.Text')
    } else if (/^(ol\/style\/fill|openlayers\/style\/fill)$/.test(request)) {
      return callback(null, 'root ' + 'ol.style.Fill')
    } else if (/^(ol\/style\/circle|openlayers\/style\/circle)$/.test(request)) {
      return callback(null, 'root ' + 'ol.style.Circle')
    } else if (/^(ol\/extent|openlayers\/extent)$/.test(request)) {
      return callback(null, 'root ' + 'ol.extent')
    } else if (/^(ol\/geom\/geometry|openlayers\/geom\/geometry)$/.test(request)) {
      return callback(null, 'root ' + 'ol.geom.Geometry')
    } else if (/^(ol\/geom\/linestring|openlayers\/geom\/linestring)$/.test(request)) {
      return callback(null, 'root ' + 'ol.geom.LineString')
    } else if (/^(ol\/geom\/linestring|openlayers\/geom\/linestring)$/.test(request)) {
      return callback(null, 'root ' + 'ol.geom.LineString')
    } else if (/^(ol\/geom\/polygon|openlayers\/geom\/polygon)$/.test(request)) {
      return callback(null, 'root ' + 'ol.geom.Polygon')
    } else if (/^(ol\/geom\/point|openlayers\/geom\/point)$/.test(request)) {
      return callback(null, 'root ' + 'ol.geom.Point')
    } else if (/^(ol\/interaction\/draw|openlayers\/interaction\/draw)$/.test(request)) {
      return callback(null, 'root ' + 'ol.interaction.Draw')
    } else if (/^(ol\/interaction\/dragpan|openlayers\/interaction\/dragpan)$/.test(request)) {
      return callback(null, 'root ' + 'ol.interaction.DragPan')
    } else if (/^(ol\/feature|openlayers\/feature)$/.test(request)) {
      return callback(null, 'root ' + 'ol.Feature')
    } else if (/^(ol\/overlay|openlayers\/overlay)$/.test(request)) {
      return callback(null, 'root ' + 'ol.Overlay')
    }
  }
  callback();
}

module.exports = externals
