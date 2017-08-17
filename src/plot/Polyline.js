
P.Plot.Polyline = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.POLYLINE;
    this.setPoints(points);
};

goog.inherits(P.Plot.Polyline, ol.geom.LineString);
goog.mixin(P.Plot.Polyline.prototype, P.Plot.prototype);

P.Plot.Polyline.prototype.generate = function(){
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    this.setCoordinates(this.points);
};