
P.Plot.RadiusCircle = function(points,params){
    goog.base(this, []);
    this.type = P.PlotTypes.RadiusCircle;
    this.fixPointCount = 2;
    this.setPoints(points);
    this.set("params",params);
};

goog.inherits(P.Plot.RadiusCircle, ol.geom.Polygon);
goog.mixin(P.Plot.RadiusCircle.prototype, P.Plot.prototype);

P.Plot.RadiusCircle.prototype.generate = function(){
    var center = this.points[0];
    var radius = P.PlotUtils.distance(center, this.points[1]);
    this.setCoordinates([this.generatePoints(center, radius)]);
};

P.Plot.RadiusCircle.prototype.generatePoints = function(center, radius){
    var x, y, angle, points=[];
    for(var i=0; i<= P.Constants.FITTING_COUNT; i++){
        angle = Math.PI*2*i/ P.Constants.FITTING_COUNT;
        x = center[0] + radius*Math.cos(angle);
        y = center[1] + radius*Math.sin(angle);
        points.push([x,y]);
    }
    return points;
};

