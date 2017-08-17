
P.Plot.FineArrow = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.FINE_ARROW;
    this.tailWidthFactor = 0.15;
    this.neckWidthFactor = 0.2;
    this.headWidthFactor = 0.25;
    this.headAngle = Math.PI / 8.5;
    this.neckAngle = Math.PI / 13;
    this.fixPointCount = 2;
    this.setPoints(points);
}

goog.inherits(P.Plot.FineArrow, ol.geom.Polygon);
goog.mixin(P.Plot.FineArrow.prototype, P.Plot.prototype);

P.Plot.FineArrow.prototype.generate = function(){
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    var pnts = this.getPoints();
    var pnt1 = pnts[0];
    var pnt2 = pnts[1];
    var len = P.PlotUtils.getBaseLength(pnts);
    var tailWidth = len * this.tailWidthFactor;
    var neckWidth = len * this.neckWidthFactor;
    var headWidth = len * this.headWidthFactor;
    var tailLeft = P.PlotUtils.getThirdPoint(pnt2, pnt1, P.Constants.HALF_PI, tailWidth, true);
    var tailRight = P.PlotUtils.getThirdPoint(pnt2, pnt1, P.Constants.HALF_PI, tailWidth, false);
    var headLeft = P.PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, false);
    var headRight = P.PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, true);
    var neckLeft = P.PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, false);
    var neckRight = P.PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, true);
    var pList = [tailLeft, neckLeft, headLeft, pnt2, headRight, neckRight, tailRight];
    this.setCoordinates([pList]);
};