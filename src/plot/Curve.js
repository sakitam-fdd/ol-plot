olPlot.Plot.Curve = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.CURVE;
  this.t = 0.3;
  this.setPoints(points);
};
olPlot.Utils.inherits(olPlot.Plot.Curve, ol.geom.LineString);
olPlot.Utils.mixin(olPlot.Plot.Curve.prototype, olPlot.Plot.prototype);
olPlot.Plot.Curve.prototype.generate = function () {
  var count = this.getPointCount();
  if (count < 2) {
    return;
  }
  if (count == 2) {
    this.setCoordinates(this.points);
  } else {
    this.setCoordinates(olPlot.PlotUtils.getCurvePoints(this.t, this.points));
  }
};