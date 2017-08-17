olPlot.Plot.StraightArrow = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.STRAIGHT_ARROW;
  this.fixPointCount = 2;
  this.maxArrowLength = 3000000;
  this.arrowLengthScale = 5;
  this.setPoints(points);
};
olPlot.Utils.inherits(olPlot.Plot.StraightArrow, ol.geom.LineString);
olPlot.Utils.mixin(olPlot.Plot.StraightArrow.prototype, olPlot.Plot.prototype);
olPlot.Plot.StraightArrow.prototype.generate = function () {
  if (this.getPointCount() < 2) {
    return;
  }
  var pnts = this.getPoints();
  var pnt1 = pnts[0];
  var pnt2 = pnts[1];
  var distance = olPlot.PlotUtils.distance(pnt1, pnt2);
  var len = distance / this.arrowLengthScale;
  len = len > this.maxArrowLength ? this.maxArrowLength : len;
  var leftPnt = olPlot.PlotUtils.getThirdPoint(pnt1, pnt2, Math.PI / 6, len, false);
  var rightPnt = olPlot.PlotUtils.getThirdPoint(pnt1, pnt2, Math.PI / 6, len, true);
  this.setCoordinates([pnt1, pnt2, leftPnt, pnt2, rightPnt]);
};