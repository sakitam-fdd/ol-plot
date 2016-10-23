
P.Plot.Marker = function(points){
    goog.base(this, [0,0]);
    this.type = P.PlotTypes.MARKER;
    this.fixPointCount = 1;
    this.setPoints(points);
}

goog.inherits(P.Plot.Marker, ol.geom.Point);
goog.mixin(P.Plot.Marker.prototype, P.Plot.prototype);

P.Plot.Marker.prototype.generate = function(){
    var pnt = this.points[0];
    this.setCoordinates(pnt);
};

