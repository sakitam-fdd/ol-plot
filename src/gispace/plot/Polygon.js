
P.Plot.Polygon = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.POLYGON;
    this.setPoints(points);
};

goog.inherits(P.Plot.Polygon, ol.geom.Polygon);
goog.mixin(P.Plot.Polygon.prototype, P.Plot.prototype);

P.Plot.Polygon.prototype.generate = function() {
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    this.setCoordinates([this.points]);
};