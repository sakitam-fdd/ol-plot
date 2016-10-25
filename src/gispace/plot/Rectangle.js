/**
 * Created by lh on 2016/4/11.
 * @Title:
 * @Description: 矩形
 * @version V1.0
 */


P.Plot.Rectangle = function (points, params) {
    goog.base(this, []);
    this.type = P.PlotTypes.Rectangle;
    this.setPoints(points);
    this.fixPointCount = 2;
    this.set("params", params);
    this.isFill = true;
    if (params.isFill == "false") {
        this.isFill = false;
    }
};

goog.inherits(P.Plot.Rectangle, ol.geom.Polygon);
goog.mixin(P.Plot.Rectangle.prototype, P.Plot.prototype);

P.Plot.Rectangle.prototype.generate = function () {
    if (this.points.length == 2) {
        var coordinates = [];
        if (this.isFill) {
            var extent = ol.extent.boundingExtent(this.points);
            var polygon = ol.geom.Polygon.fromExtent(extent);
            coordinates = polygon.getCoordinates();
        }
        else {
            var start = this.points[0];
            var end = this.points[1];
            coordinates = [start, [start[0], end[1]], end, [end[0], start[1]], start];
        }
        this.setCoordinates(coordinates);
    }
};