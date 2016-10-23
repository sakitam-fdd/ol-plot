
P.Plot.TailedAttackArrow = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.TAILED_ATTACK_ARROW;
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.tailWidthFactor = 0.1;
    this.headTailFactor = 0.8;
    this.swallowTailFactor = 1;
    this.swallowTailPnt = null;
    this.setPoints(points);
};

goog.inherits(P.Plot.TailedAttackArrow, P.Plot.AttackArrow);

P.Plot.TailedAttackArrow.prototype.generate = function(){
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    if(this.getPointCount() == 2){
        this.setCoordinates([this.points]);
        return;
    }
    var pnts = this.getPoints();
    var tailLeft = pnts[0];
    var tailRight = pnts[1];
    if(P.PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])){
        tailLeft = pnts[1];
        tailRight = pnts[0];
    }
    var midTail = P.PlotUtils.mid(tailLeft, tailRight);
    var bonePnts = [midTail].concat(pnts.slice(2));
    var headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
    var neckLeft = headPnts[0];
    var neckRight = headPnts[4];
    var tailWidth = P.PlotUtils.distance(tailLeft, tailRight);
    var allLen = P.PlotUtils.getBaseLength(bonePnts);
    var len = allLen * this.tailWidthFactor * this.swallowTailFactor;
    this.swallowTailPnt = P.PlotUtils.getThirdPoint(bonePnts[1], bonePnts[0], 0, len, true);
    var factor = tailWidth/allLen;
    var bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, factor);
    var count = bodyPnts.length;
    var leftPnts = [tailLeft].concat(bodyPnts.slice(0, count/2));
    leftPnts.push(neckLeft);
    var rightPnts = [tailRight].concat(bodyPnts.slice(count/2, count));
    rightPnts.push(neckRight);

    leftPnts = P.PlotUtils.getQBSplinePoints(leftPnts);
    rightPnts = P.PlotUtils.getQBSplinePoints(rightPnts);

    this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse(), [this.swallowTailPnt, leftPnts[0]])]);
};