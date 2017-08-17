
P.Plot.AttackArrow = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.ATTACK_ARROW;
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.headTailFactor = 0.8;
    this.setPoints(points);
};

goog.inherits(P.Plot.AttackArrow, ol.geom.Polygon);
goog.mixin(P.Plot.AttackArrow.prototype, P.Plot.prototype);

P.Plot.AttackArrow.prototype.generate = function () {
    if (this.getPointCount() < 2){
        return;
    }
    if (this.getPointCount() == 2) {
        this.setCoordinates([this.points]);
        return;
    }
    var pnts = this.getPoints();
    // 计算箭尾
    var tailLeft = pnts[0];
    var tailRight = pnts[1];
    if (P.PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])) {
        tailLeft = pnts[1];
        tailRight = pnts[0];
    }
    var midTail = P.PlotUtils.mid(tailLeft, tailRight);
    var bonePnts = [midTail].concat(pnts.slice(2));
    // 计算箭头
    var headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
    var neckLeft = headPnts[0];
    var neckRight = headPnts[4];
    var tailWidthFactor = P.PlotUtils.distance(tailLeft, tailRight) / P.PlotUtils.getBaseLength(bonePnts);
    // 计算箭身
    var bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, tailWidthFactor);
    // 整合
    var count = bodyPnts.length;
    var leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
    leftPnts.push(neckLeft);
    var rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
    rightPnts.push(neckRight);

    leftPnts = P.PlotUtils.getQBSplinePoints(leftPnts);
    rightPnts = P.PlotUtils.getQBSplinePoints(rightPnts);

    this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse())]);
};

P.Plot.AttackArrow.prototype.getArrowHeadPoints = function (points, tailLeft, tailRight) {
    var len = P.PlotUtils.getBaseLength(points);
    var headHeight = len * this.headHeightFactor;
    var headPnt = points[points.length - 1];
    len = P.PlotUtils.distance(headPnt, points[points.length - 2]);
    var tailWidth = P.PlotUtils.distance(tailLeft, tailRight);
    if (headHeight > tailWidth * this.headTailFactor) {
        headHeight = tailWidth * this.headTailFactor;
    }
    var headWidth = headHeight * this.headWidthFactor;
    var neckWidth = headHeight * this.neckWidthFactor;
    headHeight = headHeight > len ? len : headHeight;
    var neckHeight = headHeight * this.neckHeightFactor;
    var headEndPnt = P.PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
    var neckEndPnt = P.PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
    var headLeft = P.PlotUtils.getThirdPoint(headPnt, headEndPnt, P.Constants.HALF_PI, headWidth, false);
    var headRight = P.PlotUtils.getThirdPoint(headPnt, headEndPnt, P.Constants.HALF_PI, headWidth, true);
    var neckLeft = P.PlotUtils.getThirdPoint(headPnt, neckEndPnt, P.Constants.HALF_PI, neckWidth, false);
    var neckRight = P.PlotUtils.getThirdPoint(headPnt, neckEndPnt, P.Constants.HALF_PI, neckWidth, true);
    return [neckLeft, headLeft, headPnt, headRight, neckRight];
};

P.Plot.AttackArrow.prototype.getArrowBodyPoints = function (points, neckLeft, neckRight, tailWidthFactor) {
    var allLen = P.PlotUtils.wholeDistance(points);
    var len = P.PlotUtils.getBaseLength(points);
    var tailWidth = len * tailWidthFactor;
    var neckWidth = P.PlotUtils.distance(neckLeft, neckRight);
    var widthDif = (tailWidth - neckWidth) / 2;
    var tempLen = 0, leftBodyPnts = [], rightBodyPnts = [];
    for (var i = 1; i < points.length - 1; i++) {
        var angle = P.PlotUtils.getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
        tempLen += P.PlotUtils.distance(points[i - 1], points[i]);
        var w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle);
        var left = P.PlotUtils.getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
        var right = P.PlotUtils.getThirdPoint(points[i - 1], points[i], angle, w, false);
        leftBodyPnts.push(left);
        rightBodyPnts.push(right);
    }
    return leftBodyPnts.concat(rightBodyPnts);
};