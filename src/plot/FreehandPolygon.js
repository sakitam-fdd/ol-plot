
P.Plot.FreehandPolygon = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.FREEHAND_POLYGON;
    this.freehand = true;
    this.setPoints(points);
};

goog.inherits(P.Plot.FreehandPolygon, ol.geom.Polygon);
goog.mixin(P.Plot.FreehandPolygon.prototype, P.Plot.prototype);

P.Plot.FreehandPolygon.prototype.generate = function() {
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    this.setCoordinates([this.points]);
};