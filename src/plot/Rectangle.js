olPlot.Plot.Rectangle = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.RECTANGLE;
  this.fixPointCount = 2;
  this.setPoints(points);
};
olPlot.Utils.inherits(olPlot.Plot.Rectangle, ol.geom.Polygon);
olPlot.Utils.mixin(olPlot.Plot.Rectangle.prototype, olPlot.Plot.prototype);
olPlot.Plot.Rectangle.prototype.generate = function () {
  var count = this.getPointCount();
  if (count < 2) {
    return;
  } else {
    var pnt1 = this.points[0];
    var pnt2 = this.points[1];
    var xmin = Math.min(pnt1[0], pnt2[0]);
    var xmax = Math.max(pnt1[0], pnt2[0]);
    var ymin = Math.min(pnt1[1], pnt2[1]);
    var ymax = Math.max(pnt1[1], pnt2[1]);
    var tl = [xmin, ymax];
    var tr = [xmax, ymax];
    var br = [xmax, ymin];
    var bl = [xmin, ymin];
    this.setCoordinates([[tl, tr, br, bl]]);
  }
};