P.Plot.Measure = function (points,params) {
    goog.base(this, []);
    this.type = P.PlotTypes.MEASURE;
    this.set("params",params);
    this.setPoints(points);
};
goog.inherits(P.Plot.Measure, ol.geom.LineString, ol.geom.Polygon);
goog.mixin(P.Plot.Measure.prototype, P.Plot.prototype);

P.Plot.Measure.prototype.generate = function(){
    this.setCoordinates(this.points);
};