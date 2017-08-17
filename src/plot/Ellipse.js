olPlot.Plot.Ellipse = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.ELLIPSE;
  this.fixPointCount = 2;
  this.setPoints(points);
};
olPlot.Utils.inherits(olPlot.Plot.Ellipse, ol.geom.Polygon);
olPlot.Utils.mixin(olPlot.Plot.Ellipse.prototype, olPlot.Plot.prototype);
olPlot.Plot.Ellipse.prototype.generate = function () {
  var count = this.getPointCount();
  if (count < 2) {
    return;
  }
  var pnt1 = this.points[0];
  var pnt2 = this.points[1];
  var center = olPlot.PlotUtils.mid(pnt1, pnt2);
  var majorRadius = Math.abs((pnt1[0] - pnt2[0]) / 2);
  var minorRadius = Math.abs((pnt1[1] - pnt2[1]) / 2);
  this.setCoordinates([this.generatePoints(center, majorRadius, minorRadius)]);
};

olPlot.Plot.Ellipse.prototype.generatePoints = function (center, majorRadius, minorRadius) {
  var x, y, angle, points = [];
  for (var i = 0; i <= olPlot.Constants.FITTING_COUNT; i++) {
    angle = Math.PI * 2 * i / olPlot.Constants.FITTING_COUNT;
    x = center[0] + majorRadius * Math.cos(angle);
    y = center[1] + minorRadius * Math.sin(angle);
    points.push([x, y]);
  }
  return points;
};

