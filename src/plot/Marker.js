olPlot.Plot.Marker = function (points) {
  olPlot.Utils.base(this, [0, 0]);
  this.type = olPlot.PlotTypes.MARKER;
  this.fixPointCount = 1;
  this.setPoints(points);
}
olPlot.Utils.inherits(olPlot.Plot.Marker, ol.geom.Point);
olPlot.Utils.mixin(olPlot.Plot.Marker.prototype, olPlot.Plot.prototype);
olPlot.Plot.Marker.prototype.generate = function () {
  var pnt = this.points[0];
  this.setCoordinates(pnt);
};

