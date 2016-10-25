
P.Plot.Curve = function(points,params){
    goog.base(this, []);
    this.type = P.PlotTypes.CURVE;
    this.t = 0.3;
    this.setPoints(points);
    this.set("params",params);
};

goog.inherits(P.Plot.Curve, ol.geom.LineString);
goog.mixin(P.Plot.Curve.prototype, P.Plot.prototype);

P.Plot.Curve.prototype.generate = function(){
    if(this.getPointCount()==2)
        this.setCoordinates(this.points);
    else
        this.setCoordinates(P.PlotUtils.getCurvePoints(this.t, this.points));
};