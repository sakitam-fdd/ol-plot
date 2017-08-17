olPlot.Plot.Lune = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.LUNE;
  this.fixPointCount = 3;
  this.setPoints(points);
};

olPlot.Utils.inherits(olPlot.Plot.Lune, ol.geom.Polygon);
olPlot.Utils.mixin(olPlot.Plot.Lune.prototype, olPlot.Plot.prototype);

olPlot.Plot.Lune.prototype.generate = function () {
  if (this.getPointCount() < 2) {
    return;
  }
  var pnts = this.getPoints();
  if (this.getPointCount() == 2) {
    var mid = olPlot.PlotUtils.mid(pnts[0], pnts[1]);
    var d = olPlot.PlotUtils.distance(pnts[0], mid);
    var pnt = olPlot.PlotUtils.getThirdPoint(pnts[0], mid, olPlot.Constants.HALF_PI, d);
    pnts.push(pnt);
  }
  var pnt1 = pnts[0];
  var pnt2 = pnts[1];
  var pnt3 = pnts[2];
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
  var pnts = olPlot.PlotUtils.getArcPoints(center, radius, startAngle, endAngle);
  pnts.push(pnts[0]);
  this.setCoordinates([pnts]);
};