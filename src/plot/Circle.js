olPlot.Plot.Circle = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.CIRCLE;
  this.fixPointCount = 2;
  this.setPoints(points);
}
olPlot.Utils.inherits(olPlot.Plot.Circle, ol.geom.Polygon);
olPlot.Utils.mixin(olPlot.Plot.Circle.prototype, olPlot.Plot.prototype);
olPlot.Plot.Circle.prototype.generate = function () {
  var count = this.getPointCount();
  if (count < 2) {
    return;
  }
  var center = this.points[0];
  var radius = olPlot.PlotUtils.distance(center, this.points[1]);
  this.setCoordinates([this.generatePoints(center, radius)]);
};
olPlot.Plot.Circle.prototype.generatePoints = function (center, radius) {
  var x, y, angle, points = [];
  for (var i = 0; i <= olPlot.Constants.FITTING_COUNT; i++) {
    angle = Math.PI * 2 * i / olPlot.Constants.FITTING_COUNT;
    x = center[0] + radius * Math.cos(angle);
    y = center[1] + radius * Math.sin(angle);
    points.push([x, y]);
  }
  return points;
};
