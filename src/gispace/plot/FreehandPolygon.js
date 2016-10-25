
P.Plot.FreehandPolygon = function(points,params){
    goog.base(this, []);
    this.type = P.PlotTypes.FREEHAND_POLYGON;
    this.freehand = true;
    this.setPoints(points);
    this.set("params",params);
};

goog.inherits(P.Plot.FreehandPolygon, ol.geom.Polygon);
goog.mixin(P.Plot.FreehandPolygon.prototype, P.Plot.prototype);

P.Plot.FreehandPolygon.prototype.generate = function() {
    this.setCoordinates([this.points]);
};