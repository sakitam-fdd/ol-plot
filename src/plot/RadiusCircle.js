olPlot.Plot.RadiusCircle = function (points, params) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.RadiusCircle;
  this.fixPointCount = 2;
  this.setPoints(points);
  this.set("params", params);
};
olPlot.Utils.inherits(olPlot.Plot.RadiusCircle, ol.geom.Polygon);
olPlot.Utils.mixin(olPlot.Plot.RadiusCircle.prototype, olPlot.Plot.prototype);
olPlot.Plot.RadiusCircle.prototype.generate = function () {
  var center = this.points[0];
  var radius = olPlot.PlotUtils.distance(center, this.points[1]);
  this.setCoordinates([this.generatePoints(center, radius)]);
};

olPlot.Plot.RadiusCircle.prototype.generatePoints = function (center, radius) {
  var x, y, angle, points = [];
  for (var i = 0; i <= olPlot.Constants.FITTING_COUNT; i++) {
    angle = Math.PI * 2 * i / olPlot.Constants.FITTING_COUNT;
    x = center[0] + radius * Math.cos(angle);
    y = center[1] + radius * Math.sin(angle);
    points.push([x, y]);
  }
  return points;
};

