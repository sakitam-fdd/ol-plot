olPlot.Plot.FreehandLine = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.FREEHAND_LINE;
  this.freehand = true;
  this.setPoints(points);
};
olPlot.Utils.inherits(olPlot.Plot.FreehandLine, ol.geom.LineString);
olPlot.Utils.mixin(olPlot.Plot.FreehandLine.prototype, olPlot.Plot.prototype);
olPlot.Plot.FreehandLine.prototype.generate = function () {
  var count = this.getPointCount();
  if (count < 2) {
    return;
  }
  this.setCoordinates(this.points);
};