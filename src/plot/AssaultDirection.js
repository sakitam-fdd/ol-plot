olPlot.Plot.AssaultDirection = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.ASSAULT_DIRECTION;
  this.tailWidthFactor = 0.2;
  this.neckWidthFactor = 0.25;
  this.headWidthFactor = 0.3;
  this.headAngle = Math.PI / 4;
  this.neckAngle = Math.PI * 0.17741;
  this.setPoints(points);
};
olPlot.Utils.inherits(olPlot.Plot.AssaultDirection, olPlot.Plot.FineArrow);