
P.Plot.GatheringPlace = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.GATHERING_PLACE;
    this.t = 0.4;
    this.fixPointCount = 3;
    this.setPoints(points);
}

goog.inherits(P.Plot.GatheringPlace, ol.geom.Polygon);
goog.mixin(P.Plot.GatheringPlace.prototype, P.Plot.prototype);

P.Plot.GatheringPlace.prototype.generate = function(){
    var pnts = this.getPoints();
    if(pnts.length<2){
        return;
    }
    if(this.getPointCount()==2){
        var mid = P.PlotUtils.mid(pnts[0], pnts[1]);
        var d = P.PlotUtils.distance(pnts[0], mid)/0.9;
        var pnt = P.PlotUtils.getThirdPoint(pnts[0], mid, P.Constants.HALF_PI, d, true);
        pnts = [pnts[0], pnt, pnts[1]];
    }
    var mid = P.PlotUtils.mid(pnts[0], pnts[2]);
    pnts.push(mid, pnts[0], pnts[1]);

    var normals = [];
    for(var i=0; i<pnts.length-2; i++){
        var pnt1 = pnts[i];
        var pnt2 = pnts[i+1];
        var pnt3 = pnts[i+2];
        var normalPoints = P.PlotUtils.getBisectorNormals(this.t, pnt1, pnt2, pnt3);
        normals = normals.concat(normalPoints);
    }
    var count = normals.length;
    normals = [normals[count-1]].concat(normals.slice(0, count-1));
    var pList = [];
    for(i=0; i<pnts.length-2; i++){
        pnt1 = pnts[i];
        pnt2 = pnts[i+1];
        pList.push(pnt1);
        for(var t=0; t<=P.Constants.FITTING_COUNT; t++){
            var pnt = P.PlotUtils.getCubicValue(t/P.Constants.FITTING_COUNT, pnt1, normals[i*2], normals[i*2+1], pnt2);
            pList.push(pnt);
        }
        pList.push(pnt2);
    }
    this.setCoordinates([pList]);
};