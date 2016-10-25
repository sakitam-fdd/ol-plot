
P.Plot.AssaultDirection = function(points,params){
    goog.base(this, []);
    /*   this.tailWidthFactor = 0.1;
     this.neckWidthFactor = 0.2;
     this.headWidthFactor = 0.25;*/


    this.tailWidthFactor = 0.05;
    this.neckWidthFactor = 0.1;
    this.headWidthFactor = 0.15;
    this.type = P.PlotTypes.ASSAULT_DIRECTION;
    this.headAngle = Math.PI / 4;
    this.neckAngle = Math.PI * 0.17741;
    this.setPoints(points);
    this.set("params",params);
};

goog.inherits(P.Plot.AssaultDirection, P.Plot.FineArrow);