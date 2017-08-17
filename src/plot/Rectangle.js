
P.Plot.Rectangle = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.RECTANGLE;
    this.fixPointCount = 2;
    this.setPoints(points);
};

goog.inherits(P.Plot.Rectangle, ol.geom.Polygon);
goog.mixin(P.Plot.Rectangle.prototype, P.Plot.prototype);

P.Plot.Rectangle.prototype.generate = function(){
    var count = this.getPointCount();
    if(count<2) {
        return;
    }else{
        var pnt1 = this.points[0];
        var pnt2 = this.points[1];
        var xmin = Math.min(pnt1[0], pnt2[0]);
        var xmax = Math.max(pnt1[0], pnt2[0]);
        var ymin = Math.min(pnt1[1], pnt2[1]);
        var ymax = Math.max(pnt1[1], pnt2[1]);
        var tl = [xmin, ymax];
        var tr = [xmax, ymax];
        var br = [xmax, ymin];
        var bl = [xmin, ymin];
        this.setCoordinates([[tl, tr, br, bl]]);
    }
};