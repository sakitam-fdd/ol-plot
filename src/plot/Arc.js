
P.Plot.Arc = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.ARC;
    this.fixPointCount = 3;
    this.setPoints(points);
};

goog.inherits(P.Plot.Arc, ol.geom.LineString);
goog.mixin(P.Plot.Arc.prototype, P.Plot.prototype);

P.Plot.Arc.prototype.generate = function(){
    var count = this.getPointCount();
    if(count < 2){
        return;
    }
    if(count==2) {
        this.setCoordinates(this.points);
    }else{
        var pnt1 = this.points[0];
        var pnt2 = this.points[1];
        var pnt3 = this.points[2];
        var center = P.PlotUtils.getCircleCenterOfThreePoints(pnt1, pnt2, pnt3);
        var radius = P.PlotUtils.distance(pnt1, center);

        var angle1 = P.PlotUtils.getAzimuth(pnt1, center);
        var angle2 = P.PlotUtils.getAzimuth(pnt2, center);
        if(P.PlotUtils.isClockWise(pnt1, pnt2, pnt3)){
            var startAngle = angle2;
            var endAngle = angle1;
        }
        else{
            startAngle = angle1;
            endAngle = angle2;
        }
        this.setCoordinates(P.PlotUtils.getArcPoints(center, radius, startAngle, endAngle));
    }
};