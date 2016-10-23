
P.Plot.StraightArrow = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.STRAIGHT_ARROW;
    this.fixPointCount = 2;
    this.maxArrowLength = 3000000;
    this.arrowLengthScale = 5;
    this.setPoints(points);
};

goog.inherits(P.Plot.StraightArrow, ol.geom.LineString);
goog.mixin(P.Plot.StraightArrow.prototype, P.Plot.prototype);

P.Plot.StraightArrow.prototype.generate = function(){
    if(this.getPointCount()<2) {
        return;
    }
    var pnts = this.getPoints();
    var pnt1 = pnts[0];
    var pnt2 = pnts[1];
    var distance = P.PlotUtils.distance(pnt1, pnt2);
    var len = distance / this.arrowLengthScale;
    len = len > this.maxArrowLength ? this.maxArrowLength : len;
    var leftPnt = P.PlotUtils.getThirdPoint(pnt1, pnt2, Math.PI/6, len, false);
    var rightPnt = P.PlotUtils.getThirdPoint(pnt1, pnt2, Math.PI/6, len, true);
    this.setCoordinates([pnt1, pnt2, leftPnt, pnt2, rightPnt]);
};