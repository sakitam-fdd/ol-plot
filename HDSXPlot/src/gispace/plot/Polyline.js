
P.Plot.Polyline = function(points,params){
    goog.base(this, []);
    this.type = P.PlotTypes.POLYLINE;
    this.set("params",params);
    this.setPoints(points);
};

goog.inherits(P.Plot.Polyline, ol.geom.LineString);
goog.mixin(P.Plot.Polyline.prototype, P.Plot.prototype);

P.Plot.Polyline.prototype.generate = function(){
    this.setCoordinates(this.points);
};