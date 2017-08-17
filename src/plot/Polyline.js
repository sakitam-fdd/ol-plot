olPlot.Plot.Polyline = function(points){
  olPlot.Utils.base(this, []);
    this.type = olPlot.PlotTypes.POLYLINE;
    this.setPoints(points);
};
olPlot.Utils.inherits(olPlot.Plot.Polyline, ol.geom.LineString);
olPlot.Utils.mixin(olPlot.Plot.Polyline.prototype, olPlot.Plot.prototype);
olPlot.Plot.Polyline.prototype.generate = function(){
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    this.setCoordinates(this.points);
};