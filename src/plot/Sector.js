olPlot.Plot.Sector = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.SECTOR;
  this.fixPointCount = 3;
  this.setPoints(points);
};
olPlot.Utils.inherits(olPlot.Plot.Sector, ol.geom.Polygon);
olPlot.Utils.mixin(olPlot.Plot.Sector.prototype, olPlot.Plot.prototype);
olPlot.Plot.Sector.prototype.generate = function () {
  if (this.getPointCount() < 2)
    return;
  if (this.getPointCount() == 2)
    this.setCoordinates([this.points]);
  else {
    var pnts = this.getPoints();
    var center = pnts[0];
    var pnt2 = pnts[1];
    var pnt3 = pnts[2];
    var radius = olPlot.PlotUtils.distance(pnt2, center);
    var startAngle = olPlot.PlotUtils.getAzimuth(pnt2, center);
    var endAngle = olPlot.PlotUtils.getAzimuth(pnt3, center);
    var pList = olPlot.PlotUtils.getArcPoints(center, radius, startAngle, endAngle);
    pList.push(center, pList[0]);
    this.setCoordinates([pList]);
  }
};