olPlot.Plot.Arc = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.ARC;
  this.fixPointCount = 3;
  this.setPoints(points);
};
olPlot.Utils.inherits(olPlot.Plot.Arc, ol.geom.LineString);
olPlot.Utils.mixin(olPlot.Plot.Arc.prototype, olPlot.Plot.prototype);

olPlot.Plot.Arc.prototype.generate = function () {
  var count = this.getPointCount();
  if (count < 2) {
    return;
  }
  if (count == 2) {
    this.setCoordinates(this.points);
  } else {
    var pnt1 = this.points[0];
    var pnt2 = this.points[1];
    var pnt3 = this.points[2];
    var center = olPlot.PlotUtils.getCircleCenterOfThreePoints(pnt1, pnt2, pnt3);
    var radius = olPlot.PlotUtils.distance(pnt1, center);

    var angle1 = olPlot.PlotUtils.getAzimuth(pnt1, center);
    var angle2 = olPlot.PlotUtils.getAzimuth(pnt2, center);
    if (olPlot.PlotUtils.isClockWise(pnt1, pnt2, pnt3)) {
      var startAngle = angle2;
      var endAngle = angle1;
    }
    else {
      startAngle = angle1;
      endAngle = angle2;
    }
    this.setCoordinates(olPlot.PlotUtils.getArcPoints(center, radius, startAngle, endAngle));
  }
};