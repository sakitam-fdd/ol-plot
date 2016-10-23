
P.Plot.AssaultDirection = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.ASSAULT_DIRECTION;
    this.tailWidthFactor = 0.2;
    this.neckWidthFactor = 0.25;
    this.headWidthFactor = 0.3;
    this.headAngle = Math.PI / 4;
    this.neckAngle = Math.PI * 0.17741;
    this.setPoints(points);
};

goog.inherits(P.Plot.AssaultDirection, P.Plot.FineArrow);