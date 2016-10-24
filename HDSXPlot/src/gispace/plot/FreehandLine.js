
P.Plot.FreehandLine = function(points,params){
    goog.base(this, []);
    this.type = P.PlotTypes.FREEHAND_LINE;
    this.freehand =  true;
    this.setPoints(points);
    this.set("params",params);
};

goog.inherits(P.Plot.FreehandLine, ol.geom.LineString);
goog.mixin(P.Plot.FreehandLine.prototype, P.Plot.prototype);

P.Plot.FreehandLine.prototype.generate = function(){
    this.setCoordinates(this.points);
};