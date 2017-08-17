olPlot.Plot.Polygon = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.POLYGON;
  this.setPoints(points);
};
olPlot.Utils.inherits(olPlot.Plot.Polygon, ol.geom.Polygon);
olPlot.Utils.mixin(olPlot.Plot.Polygon.prototype, olPlot.Plot.prototype);
olPlot.Plot.Polygon.prototype.generate = function () {
  var count = this.getPointCount();
  if (count < 2) {
    return;
  }
  this.setCoordinates([this.points]);
};