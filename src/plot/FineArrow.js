olPlot.Plot.FineArrow = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.FINE_ARROW;
  this.tailWidthFactor = 0.15;
  this.neckWidthFactor = 0.2;
  this.headWidthFactor = 0.25;
  this.headAngle = Math.PI / 8.5;
  this.neckAngle = Math.PI / 13;
  this.fixPointCount = 2;
  this.setPoints(points);
}
olPlot.Utils.inherits(olPlot.Plot.FineArrow, ol.geom.Polygon);
olPlot.Utils.mixin(olPlot.Plot.FineArrow.prototype, olPlot.Plot.prototype);
olPlot.Plot.FineArrow.prototype.generate = function () {
  var count = this.getPointCount();
  if (count < 2) {
    return;
  }
  var pnts = this.getPoints();
  var pnt1 = pnts[0];
  var pnt2 = pnts[1];
  var len = olPlot.PlotUtils.getBaseLength(pnts);
  var tailWidth = len * this.tailWidthFactor;
  var neckWidth = len * this.neckWidthFactor;
  var headWidth = len * this.headWidthFactor;
  var tailLeft = olPlot.PlotUtils.getThirdPoint(pnt2, pnt1, olPlot.Constants.HALF_PI, tailWidth, true);
  var tailRight = olPlot.PlotUtils.getThirdPoint(pnt2, pnt1, olPlot.Constants.HALF_PI, tailWidth, false);
  var headLeft = olPlot.PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, false);
  var headRight = olPlot.PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, true);
  var neckLeft = olPlot.PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, false);
  var neckRight = olPlot.PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, true);
  var pList = [tailLeft, neckLeft, headLeft, pnt2, headRight, neckRight, tailRight];
  this.setCoordinates([pList]);
};