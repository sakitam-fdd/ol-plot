
P.Plot.Lune = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.LUNE;
    this.fixPointCount = 3;
    this.setPoints(points);
};

goog.inherits(P.Plot.Lune, ol.geom.Polygon);
goog.mixin(P.Plot.Lune.prototype, P.Plot.prototype);

P.Plot.Lune.prototype.generate = function(){
    if(this.getPointCount()<2) {
        return;
    }
    var pnts = this.getPoints();
    if(this.getPointCount()==2){
        var mid = P.PlotUtils.mid(pnts[0], pnts[1]);
        var d = P.PlotUtils.distance(pnts[0], mid);
        var pnt = P.PlotUtils.getThirdPoint(pnts[0], mid, P.Constants.HALF_PI, d);
        pnts.push(pnt);
    }
    var pnt1 = pnts[0];
    var pnt2 = pnts[1];
    var pnt3 = pnts[2];
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
    var pnts = P.PlotUtils.getArcPoints(center, radius, startAngle, endAngle);
    pnts.push(pnts[0]);
    this.setCoordinates([pnts]);
};