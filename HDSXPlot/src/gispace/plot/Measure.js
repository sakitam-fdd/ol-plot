P.Plot.Measure = function (points, params) {
    goog.base(this, []);
    this.type = P.PlotTypes.CIRCLE;
    this.fixPointCount = 2;
    this.setPoints(points);
    this.set("params", params);
};