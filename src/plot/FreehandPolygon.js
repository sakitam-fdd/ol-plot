olPlot.Plot.FreehandPolygon = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.FREEHAND_POLYGON;
  this.freehand = true;
  this.setPoints(points);
};
olPlot.Utils.inherits(olPlot.Plot.FreehandPolygon, ol.geom.Polygon);
olPlot.Utils.mixin(olPlot.Plot.FreehandPolygon.prototype, olPlot.Plot.prototype);
olPlot.Plot.FreehandPolygon.prototype.generate = function () {
  var count = this.getPointCount();
  if (count < 2) {
    return;
  }
  this.setCoordinates([this.points]);
};