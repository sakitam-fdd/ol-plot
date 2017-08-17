olPlot.Plot.AttackArrow = function (points) {
  olPlot.Utils.base(this, []);
  this.type = olPlot.PlotTypes.ATTACK_ARROW;
  this.headHeightFactor = 0.18;
  this.headWidthFactor = 0.3;
  this.neckHeightFactor = 0.85;
  this.neckWidthFactor = 0.15;
  this.headTailFactor = 0.8;
  this.setPoints(points);
};

olPlot.Utils.inherits(olPlot.Plot.AttackArrow, ol.geom.Polygon);
olPlot.Utils.mixin(olPlot.Plot.AttackArrow.prototype, olPlot.Plot.prototype);

olPlot.Plot.AttackArrow.prototype.generate = function () {
  if (this.getPointCount() < 2) {
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
  if (olPlot.PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])) {
    tailLeft = pnts[1];
    tailRight = pnts[0];
  }
  var midTail = olPlot.PlotUtils.mid(tailLeft, tailRight);
  var bonePnts = [midTail].concat(pnts.slice(2));
  // 计算箭头
  var headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
  var neckLeft = headPnts[0];
  var neckRight = headPnts[4];
  var tailWidthFactor = olPlot.PlotUtils.distance(tailLeft, tailRight) / olPlot.PlotUtils.getBaseLength(bonePnts);
  // 计算箭身
  var bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, tailWidthFactor);
  // 整合
  var count = bodyPnts.length;
  var leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
  leftPnts.push(neckLeft);
  var rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
  rightPnts.push(neckRight);

  leftPnts = olPlot.PlotUtils.getQBSplinePoints(leftPnts);
  rightPnts = olPlot.PlotUtils.getQBSplinePoints(rightPnts);

  this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse())]);
};

olPlot.Plot.AttackArrow.prototype.getArrowHeadPoints = function (points, tailLeft, tailRight) {
  var len = olPlot.PlotUtils.getBaseLength(points);
  var headHeight = len * this.headHeightFactor;
  var headPnt = points[points.length - 1];
  len = olPlot.PlotUtils.distance(headPnt, points[points.length - 2]);
  var tailWidth = olPlot.PlotUtils.distance(tailLeft, tailRight);
  if (headHeight > tailWidth * this.headTailFactor) {
    headHeight = tailWidth * this.headTailFactor;
  }
  var headWidth = headHeight * this.headWidthFactor;
  var neckWidth = headHeight * this.neckWidthFactor;
  headHeight = headHeight > len ? len : headHeight;
  var neckHeight = headHeight * this.neckHeightFactor;
  var headEndPnt = olPlot.PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
  var neckEndPnt = olPlot.PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
  var headLeft = olPlot.PlotUtils.getThirdPoint(headPnt, headEndPnt, olPlot.Constants.HALF_PI, headWidth, false);
  var headRight = olPlot.PlotUtils.getThirdPoint(headPnt, headEndPnt, olPlot.Constants.HALF_PI, headWidth, true);
  var neckLeft = olPlot.PlotUtils.getThirdPoint(headPnt, neckEndPnt, olPlot.Constants.HALF_PI, neckWidth, false);
  var neckRight = olPlot.PlotUtils.getThirdPoint(headPnt, neckEndPnt, olPlot.Constants.HALF_PI, neckWidth, true);
  return [neckLeft, headLeft, headPnt, headRight, neckRight];
};

olPlot.Plot.AttackArrow.prototype.getArrowBodyPoints = function (points, neckLeft, neckRight, tailWidthFactor) {
  var allLen = olPlot.PlotUtils.wholeDistance(points);
  var len = olPlot.PlotUtils.getBaseLength(points);
  var tailWidth = len * tailWidthFactor;
  var neckWidth = olPlot.PlotUtils.distance(neckLeft, neckRight);
  var widthDif = (tailWidth - neckWidth) / 2;
  var tempLen = 0, leftBodyPnts = [], rightBodyPnts = [];
  for (var i = 1; i < points.length - 1; i++) {
    var angle = olPlot.PlotUtils.getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
    tempLen += olPlot.PlotUtils.distance(points[i - 1], points[i]);
    var w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle);
    var left = olPlot.PlotUtils.getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
    var right = olPlot.PlotUtils.getThirdPoint(points[i - 1], points[i], angle, w, false);
    leftBodyPnts.push(left);
    rightBodyPnts.push(right);
  }
  return leftBodyPnts.concat(rightBodyPnts);
};