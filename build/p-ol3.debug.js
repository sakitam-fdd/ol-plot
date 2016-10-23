
var P = {
    version: "1.0.0"
};

function expose() {
    var old = window.P;

    P.noConflict = function () {
        window.P = old;
        return this;
    };

    window.P = P;
}

// define P for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = P;

// define P as an AMD module
} else if (typeof define === 'function' && define.amd) {
    define(P);
}

// define gispace as a global P variable, saving the original P to restore later if needed
if (typeof window !== 'undefined') {
    expose();
}

P.Constants = {
    TWO_PI : Math.PI * 2,
    HALF_PI : Math.PI / 2,
    FITTING_COUNT : 100,
    ZERO_TOLERANCE : 0.0001  
};

P.Utils = {
    _stampId: 0
};

P.Utils.trim = function(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
};

P.Utils.stamp = function(obj) {
    var key = '_p_id_';
    obj[key] = obj[key] || this._stampId++;
    return obj[key];
};


P.DomUtils = {};

P.DomUtils.create = function(tagName, className, parent, id) {
    var element = document.createElement(tagName);
    element.className = className || '';
    if(id){
        element.id = id;
    }
    if (parent) {
        parent.appendChild(element);
    }
    return element;
};

P.DomUtils.createHidden = function(tagName, parent, id) {
    var element = document.createElement(tagName);
    element.style.display = 'none';
    if(id){
        element.id = id;
    }
    if(parent){
        parent.appendChild(element);
    }
    return element;
};

P.DomUtils.remove = function(element, parent) {
    if (parent && element) {
        parent.removeChild(element);
    }
};

P.DomUtils.get = function(id) {
    return document.getElementById(id);
};

P.DomUtils.getStyle = function(element, name) {
    var value = element.style[name];
    return value === 'auto' ? null : value;
};

P.DomUtils.hasClass = function(element, name) {
    return (element.className.length > 0) &&
        new RegExp('(^|\\s)' + name + '(\\s|$)').test(element.className);
};

P.DomUtils.addClass = function(element, name) {
    if (this.hasClass(element, name)) {
        return;
    }
    if (element.className) {
        element.className += ' ';
    }
    element.className += name;
};

P.DomUtils.removeClass = function(element, name) {
    element.className = P.Utils.trim((' ' + element.className + ' ').replace(' ' + name + ' ', ' '));
};

P.DomUtils.getDomEventKey = function(type, fn, context) {
    return '_p_dom_event_' + type + '_' + P.Utils.stamp(fn) + (context ? '_' + P.Utils.stamp(context) : '');
};

P.DomUtils.addListener = function(element, type, fn, context) {
    var self = this,
        eventKey = P.DomUtils.getDomEventKey(type, fn, context),
        handler = element[eventKey];

    if (handler) {
        return self;
    }

    handler = function(e) {
        return fn.call(context || element, e);
    };

    if ('addEventListener' in element) {
        element.addEventListener(type, handler, false);
    } else if ('attachEvent' in element) {
        element.attachEvent('on' + type, handler);
    }

    element[eventKey] = handler;
    return self;
};

P.DomUtils.removeListener = function(element, type, fn, context) {
    var self = this,
        eventKey = P.DomUtils.getDomEventKey(type, fn, context),
        handler = element[eventKey];

    if (!handler) {
        return self;
    }

    if ('removeEventListener' in element) {
        element.removeEventListener(type, handler, false);
    } else if ('detachEvent' in element) {
        element.detachEvent('on' + type, handler);
    }

    element[eventKey] = null;

    return self;
};

P.PlotTypes = {
    ARC: "arc",
    ELLIPSE: "ellipse",
    CURVE: "curve",
    CLOSED_CURVE: "closedcurve",
    LUNE: "lune",
    SECTOR: "sector",
    GATHERING_PLACE: "gatheringplace",
    STRAIGHT_ARROW: "straightarrow",
    ASSAULT_DIRECTION: "assaultdirection",
    ATTACK_ARROW: "attackarrow",
    TAILED_ATTACK_ARROW: "tailedattackarrow",
    SQUAD_COMBAT: "squadcombat",
    TAILED_SQUAD_COMBAT: "tailedsquadcombat",
    FINE_ARROW: "finearrow",
    CIRCLE: "circle",
    DOUBLE_ARROW: "doublearrow",
    POLYLINE: "polyline",
    FREEHAND_LINE: "freehandline",
    POLYGON: "polygon",
    FREEHAND_POLYGON: "freehandpolygon",
    RECTANGLE: "rectangle", 
    MARKER: "marker",
    TRIANGLE: "triangle"
};

P.PlotUtils = {};

P.PlotUtils.distance = function(pnt1, pnt2){
    return Math.sqrt(Math.pow((pnt1[0] - pnt2[0]), 2) + Math.pow((pnt1[1] - pnt2[1]), 2));
};

P.PlotUtils.wholeDistance = function(points){
    var distance = 0;
    for(var i=0; i<points.length-1; i++)
    distance += P.PlotUtils.distance(points[i], points[i+1]);
    return distance;
};

P.PlotUtils.getBaseLength = function(points){
    return Math.pow(P.PlotUtils.wholeDistance(points), 0.99);
    //return P.PlotUtils.wholeDistance(points);
};

P.PlotUtils.mid = function(pnt1, pnt2){
    return [(pnt1[0]+pnt2[0])/2, (pnt1[1]+pnt2[1])/2];
};

P.PlotUtils.getCircleCenterOfThreePoints = function(pnt1, pnt2, pnt3){
    var pntA = [(pnt1[0]+pnt2[0])/2, (pnt1[1]+pnt2[1])/2];
    var pntB = [pntA[0]-pnt1[1]+pnt2[1], pntA[1]+pnt1[0]-pnt2[0]];
    var pntC = [(pnt1[0]+pnt3[0])/2, (pnt1[1]+pnt3[1])/2];
    var pntD = [pntC[0]-pnt1[1]+pnt3[1], pntC[1]+pnt1[0]-pnt3[0]];
    return P.PlotUtils.getIntersectPoint(pntA, pntB, pntC, pntD);
};

P.PlotUtils.getIntersectPoint = function(pntA, pntB, pntC, pntD){
    if(pntA[1] == pntB[1]){
        var f = (pntD[0]-pntC[0])/(pntD[1]-pntC[1]);
        var x = f*(pntA[1]-pntC[1])+pntC[0];
        var y = pntA[1];
        return [x, y];
    }
    if(pntC[1] == pntD[1]){
        var e = (pntB[0]-pntA[0])/(pntB[1]-pntA[1]);
        x = e*(pntC[1]-pntA[1])+pntA[0];
        y = pntC[1];
        return [x, y];
    }
    e = (pntB[0]-pntA[0])/(pntB[1]-pntA[1]);
    f = (pntD[0]-pntC[0])/(pntD[1]-pntC[1]);
    y = (e*pntA[1]-pntA[0]-f*pntC[1]+pntC[0])/(e-f);
    x = e*y-e*pntA[1]+pntA[0];
    return [x, y];
};

P.PlotUtils.getAzimuth = function(startPnt, endPnt){
    var azimuth;
    var angle=Math.asin(Math.abs(endPnt[1] - startPnt[1]) / P.PlotUtils.distance(startPnt, endPnt));
    if (endPnt[1] >= startPnt[1] && endPnt[0] >= startPnt[0])
        azimuth=angle + Math.PI;
    else if (endPnt[1] >= startPnt[1] && endPnt[0] < startPnt[0])
        azimuth=P.Constants.TWO_PI - angle;
    else if (endPnt[1] < startPnt[1] && endPnt[0] < startPnt[0])
        azimuth=angle;
    else if (endPnt[1] < startPnt[1] && endPnt[0] >= startPnt[0])
        azimuth=Math.PI - angle;
    return azimuth;
};

P.PlotUtils.getAngleOfThreePoints = function(pntA, pntB, pntC){
    var angle=P.PlotUtils.getAzimuth(pntB, pntA) - P.PlotUtils.getAzimuth(pntB, pntC);
    return (angle<0 ? angle + P.Constants.TWO_PI : angle);
};

P.PlotUtils.isClockWise = function(pnt1, pnt2, pnt3){
    return ((pnt3[1]-pnt1[1])*(pnt2[0]-pnt1[0]) > (pnt2[1]-pnt1[1])*(pnt3[0]-pnt1[0]));
};

P.PlotUtils.getPointOnLine = function(t, startPnt, endPnt){
    var x = startPnt[0] + (t * (endPnt[0] - startPnt[0]));
    var y = startPnt[1] + (t * (endPnt[1] - startPnt[1]));
    return [x, y];
};

P.PlotUtils.getCubicValue = function(t, startPnt, cPnt1, cPnt2, endPnt){
    t = Math.max(Math.min(t, 1), 0);
    var tp = 1 - t;
    var t2 = t * t;
    var t3 = t2 * t;
    var tp2 = tp * tp;
    var tp3 = tp2 * tp;
    var x = (tp3*startPnt[0]) + (3*tp2*t*cPnt1[0]) + (3*tp*t2*cPnt2[0]) + (t3*endPnt[0]);
    var y = (tp3*startPnt[1]) + (3*tp2*t*cPnt1[1]) + (3*tp*t2*cPnt2[1]) + (t3*endPnt[1]);
    return [x, y];
};

P.PlotUtils.getThirdPoint = function(startPnt, endPnt, angle, distance, clockWise){
    var azimuth=P.PlotUtils.getAzimuth(startPnt, endPnt);
    var alpha = clockWise ? azimuth+angle : azimuth-angle;
    var dx=distance * Math.cos(alpha);
    var dy=distance * Math.sin(alpha);
    return [endPnt[0] + dx, endPnt[1] + dy]; 
};

P.PlotUtils.getArcPoints = function(center, radius, startAngle, endAngle){
    var x, y, pnts=[];
    var angleDiff = endAngle - startAngle;
    angleDiff = angleDiff < 0 ? angleDiff + P.Constants.TWO_PI : angleDiff;
    for (var i=0; i<=P.Constants.FITTING_COUNT; i++)
    {
        var angle = startAngle + angleDiff * i / P.Constants.FITTING_COUNT;
        x=center[0] + radius * Math.cos(angle);
        y=center[1] + radius * Math.sin(angle);
        pnts.push([x, y]);
    }
    return pnts;
};

P.PlotUtils.getBisectorNormals = function(t, pnt1, pnt2, pnt3){
    var normal = P.PlotUtils.getNormal(pnt1, pnt2, pnt3);
    var dist = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1]);
    var uX = normal[0]/dist;
    var uY = normal[1]/dist;
    var d1 = P.PlotUtils.distance(pnt1, pnt2);
    var d2 = P.PlotUtils.distance(pnt2, pnt3);
    if(dist > P.Constants.ZERO_TOLERANCE){
        if(P.PlotUtils.isClockWise(pnt1, pnt2, pnt3)){
            var dt = t * d1;
            var x = pnt2[0] - dt*uY;
            var y = pnt2[1] + dt*uX;
            var bisectorNormalRight = [x, y];
            dt = t * d2;
            x = pnt2[0] + dt*uY;
            y = pnt2[1] - dt*uX;
            var bisectorNormalLeft = [x, y];
        }
        else{
            dt = t * d1;
            x = pnt2[0] + dt*uY;
            y = pnt2[1] - dt*uX;
            bisectorNormalRight = [x, y];
            dt = t * d2;
            x = pnt2[0] - dt*uY;
            y = pnt2[1] + dt*uX;
            bisectorNormalLeft = [x, y];
        }
    }
    else{
        x = pnt2[0] + t*(pnt1[0] - pnt2[0]);
        y = pnt2[1] + t*(pnt1[1] - pnt2[1]);
        bisectorNormalRight = [x, y];
        x = pnt2[0] + t*(pnt3[0] - pnt2[0]);
        y = pnt2[1] + t*(pnt3[1] - pnt2[1]);
        bisectorNormalLeft = [x, y];
    }
    return [bisectorNormalRight, bisectorNormalLeft];
};

P.PlotUtils.getNormal = function(pnt1, pnt2, pnt3){
    var dX1 = pnt1[0] - pnt2[0];
    var dY1 = pnt1[1] - pnt2[1];
    var d1 = Math.sqrt(dX1*dX1 + dY1*dY1);
    dX1 /= d1;
    dY1 /= d1;

    var dX2 = pnt3[0] - pnt2[0];
    var dY2 = pnt3[1] - pnt2[1];
    var d2 = Math.sqrt(dX2*dX2 + dY2*dY2);
    dX2 /= d2;
    dY2 /= d2;

    var uX = dX1 + dX2;
    var uY = dY1 + dY2;
    return [uX, uY];
};

P.PlotUtils.getCurvePoints = function(t, controlPoints){
    var leftControl = P.PlotUtils.getLeftMostControlPoint(controlPoints);
    var normals = [leftControl];
    for(var i=0; i<controlPoints.length-2; i++){
        var pnt1 = controlPoints[i];
        var pnt2 = controlPoints[i+1];
        var pnt3 = controlPoints[i+2];
        var normalPoints = P.PlotUtils.getBisectorNormals(t, pnt1, pnt2, pnt3);
        normals = normals.concat(normalPoints);
    }
    var rightControl = P.PlotUtils.getRightMostControlPoint(controlPoints);
    normals.push(rightControl);
    var points = [];
    for(i=0; i<controlPoints.length-1; i++){
        pnt1 = controlPoints[i];
        pnt2 = controlPoints[i+1];
        points.push(pnt1);
        for(var t=0; t<P.Constants.FITTING_COUNT; t++){
            var pnt = P.PlotUtils.getCubicValue(t/P.Constants.FITTING_COUNT, pnt1, normals[i*2], normals[i*2+1], pnt2);
            points.push(pnt);
        }
        points.push(pnt2);
    }
    return points;
};

P.PlotUtils.getLeftMostControlPoint = function(controlPoints){
    var pnt1 = controlPoints[0];
    var pnt2 = controlPoints[1];
    var pnt3 = controlPoints[2];
    var pnts = P.PlotUtils.getBisectorNormals(0, pnt1, pnt2, pnt3);
    var normalRight = pnts[0];
    var normal = P.PlotUtils.getNormal(pnt1, pnt2, pnt3);
    var dist = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1]);
    if(dist > P.Constants.ZERO_TOLERANCE){
        var mid = P.PlotUtils.mid(pnt1, pnt2);
        var pX = pnt1[0] - mid[0];
        var pY = pnt1[1] - mid[1];

        var d1 = P.PlotUtils.distance(pnt1, pnt2);
        // normal at midpoint
        var n  = 2.0/d1;
        var nX = -n*pY;
        var nY = n*pX;

        // upper triangle of symmetric transform matrix
        var a11 = nX*nX - nY*nY
        var a12 = 2*nX*nY;
        var a22 = nY*nY - nX*nX;

        var dX = normalRight[0] - mid[0];
        var dY = normalRight[1] - mid[1];

        // coordinates of reflected vector
        var controlX = mid[0] + a11*dX + a12*dY;
        var controlY = mid[1] + a12*dX + a22*dY;
    }
    else{
        controlX = pnt1[0] + t*(pnt2[0] - pnt1[0]);
        controlY = pnt1[1] + t*(pnt2[1] - pnt1[1]);
    }
    return [controlX, controlY];
};

P.PlotUtils.getRightMostControlPoint = function(controlPoints){
    var count = controlPoints.length;
    var pnt1 = controlPoints[count-3];
    var pnt2 = controlPoints[count-2];
    var pnt3 = controlPoints[count-1];
    var pnts = P.PlotUtils.getBisectorNormals(0, pnt1, pnt2, pnt3);
    var normalLeft = pnts[1];
    var normal = P.PlotUtils.getNormal(pnt1, pnt2, pnt3);
    var dist = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1]);
    if(dist > P.Constants.ZERO_TOLERANCE){
        var mid = P.PlotUtils.mid(pnt2, pnt3);
        var pX = pnt3[0] - mid[0];
        var pY = pnt3[1] - mid[1];

        var d1 = P.PlotUtils.distance(pnt2, pnt3);
        // normal at midpoint
        var n  = 2.0/d1;
        var nX = -n*pY;
        var nY = n*pX;

        // upper triangle of symmetric transform matrix
        var a11 = nX*nX - nY*nY
        var a12 = 2*nX*nY;
        var a22 = nY*nY - nX*nX;

        var dX = normalLeft[0] - mid[0];
        var dY = normalLeft[1] - mid[1];

        // coordinates of reflected vector
        var controlX = mid[0] + a11*dX + a12*dY;
        var controlY = mid[1] + a12*dX + a22*dY;
    }
    else{
        controlX = pnt3[0] + t*(pnt2[0] - pnt3[0]);
        controlY = pnt3[1] + t*(pnt2[1] - pnt3[1]);
    }
    return [controlX, controlY];
};

P.PlotUtils.getBezierPoints = function(points){
    if (points.length <= 2)
        return points;

    var bezierPoints=[];
    var n=points.length - 1;
    for (var t=0; t <= 1; t+=0.01){
        var x=y=0;
        for (var index=0; index <= n; index++){
            var factor=P.PlotUtils.getBinomialFactor(n, index);
            var a=Math.pow(t, index);
            var b=Math.pow((1 - t), (n - index));
            x+=factor * a * b * points[index][0];
            y+=factor * a * b * points[index][1];
        }
        bezierPoints.push([x, y]);
    }
    bezierPoints.push(points[n]);
    return bezierPoints;
};

P.PlotUtils.getBinomialFactor = function(n, index){
    return P.PlotUtils.getFactorial(n) / (P.PlotUtils.getFactorial(index) * P.PlotUtils.getFactorial(n - index));
};

P.PlotUtils.getFactorial = function(n){
    if (n <= 1)
        return 1;
    if (n == 2)
        return 2;
    if (n == 3)
        return 6;
    if (n == 4)
        return 24;
    if (n == 5)
        return 120;
    var result=1;
    for (var i=1; i <= n; i++)
        result*=i;
    return result;
};

P.PlotUtils.getQBSplinePoints = function(points){
    if (points.length <= 2 )
        return points;

    var n = 2;

    var bSplinePoints=[];
    var m=points.length - n - 1;
    bSplinePoints.push(points[0]);
    for (var i=0; i <= m; i++){
        for (var t=0; t <= 1; t+=0.05){
            var x=y=0;
            for (var k=0; k <= n; k++){
                var factor=P.PlotUtils.getQuadricBSplineFactor(k, t);
                x+=factor * points[i + k][0];
                y+=factor * points[i + k][1];
            }
            bSplinePoints.push([x, y]);
        }
    }
    bSplinePoints.push(points[points.length - 1]);
    return bSplinePoints;
};

P.PlotUtils.getQuadricBSplineFactor = function(k, t){
    if (k == 0)
        return Math.pow(t - 1, 2) / 2;
    if (k == 1)
        return (-2 * Math.pow(t, 2) + 2 * t + 1) / 2;
    if (k == 2)
        return Math.pow(t, 2) / 2;
    return 0;
};
P.Event = {};

P.Event.EventType = {};

P.Event.EventType.MOUSEMOVE = 'mousemove';
P.Event.EventType.MOUSEUP = 'mouseup';
P.Event.EventType.MOUSEDOWN = 'mousedown';

P.Event.PlotDrawEvent = function(type, feature){
    goog.base(this, type);
    this.feature = feature;
};

goog.inherits(P.Event.PlotDrawEvent, goog.events.Event);

P.Event.PlotDrawEvent.DRAW_START = "draw_start";
P.Event.PlotDrawEvent.DRAW_END = "draw_end";

P.Plot = function(points){
    this.setPoints(points);
};

P.Plot.prototype = {

    isPlot: function(){
        return true;
    },

    setPoints: function(value){
        this.points = value ? value : [];
        if(this.points.length>=1)
            this.generate();
    },

    getPoints: function(){
        return this.points.slice(0);
    },

    getPointCount: function(){
        return this.points.length;
    },

    updatePoint: function(point, index){
        if(index>=0 && index<this.points.length){
            this.points[index] = point;
            this.generate();
        }
    },

    updateLastPoint: function(point){
        this.updatePoint(point, this.points.length-1);
    },

    generate: function(){
    },

    finishDrawing: function(){

    }

};



P.Plot.Arc = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.ARC;
    this.fixPointCount = 3;
    this.setPoints(points);
};

goog.inherits(P.Plot.Arc, ol.geom.LineString);
goog.mixin(P.Plot.Arc.prototype, P.Plot.prototype);

P.Plot.Arc.prototype.generate = function(){
    var count = this.getPointCount();
    if(count < 2){
        return;
    }
    if(count==2) {
        this.setCoordinates(this.points);
    }else{
        var pnt1 = this.points[0];
        var pnt2 = this.points[1];
        var pnt3 = this.points[2];
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
        this.setCoordinates(P.PlotUtils.getArcPoints(center, radius, startAngle, endAngle));
    }
};

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

P.Plot.SquadCombat = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.SQUAD_COMBAT;
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.tailWidthFactor = 0.1;
    this.setPoints(points);
};

goog.inherits(P.Plot.SquadCombat, P.Plot.AttackArrow);

P.Plot.SquadCombat.prototype.generate = function () {
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    var pnts = this.getPoints();
    var tailPnts = this.getTailPoints(pnts);
    var headPnts = this.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[1]);
    var neckLeft = headPnts[0];
    var neckRight = headPnts[4];
    var bodyPnts = this.getArrowBodyPoints(pnts, neckLeft, neckRight, this.tailWidthFactor);
    var count = bodyPnts.length;
    var leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, count / 2));
    leftPnts.push(neckLeft);
    var rightPnts = [tailPnts[1]].concat(bodyPnts.slice(count / 2, count));
    rightPnts.push(neckRight);

    leftPnts = P.PlotUtils.getQBSplinePoints(leftPnts);
    rightPnts = P.PlotUtils.getQBSplinePoints(rightPnts);

    this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse())]);
};

P.Plot.SquadCombat.prototype.getTailPoints = function (points) {
    var allLen = P.PlotUtils.getBaseLength(points);
    var tailWidth = allLen * this.tailWidthFactor;
    var tailLeft = P.PlotUtils.getThirdPoint(points[1], points[0], P.Constants.HALF_PI, tailWidth, false);
    var tailRight = P.PlotUtils.getThirdPoint(points[1], points[0], P.Constants.HALF_PI, tailWidth, true);
    return [tailLeft, tailRight];
};

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

P.Plot.TailedSquadCombat = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.TAILED_SQUAD_COMBAT;
    this.headHeightFactor = 0.18;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.tailWidthFactor = 0.1;
    this.swallowTailFactor = 1;
    this.swallowTailPnt = null;
    this.setPoints(points);
};

goog.inherits(P.Plot.TailedSquadCombat, P.Plot.AttackArrow);

P.Plot.TailedSquadCombat.prototype.generate = function () {
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    var pnts = this.getPoints();
    var tailPnts = this.getTailPoints(pnts);
    var headPnts = this.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[2]);
    var neckLeft = headPnts[0];
    var neckRight = headPnts[4];
    var bodyPnts = this.getArrowBodyPoints(pnts, neckLeft, neckRight, this.tailWidthFactor);
    var count = bodyPnts.length;
    var leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, count / 2));
    leftPnts.push(neckLeft);
    var rightPnts = [tailPnts[2]].concat(bodyPnts.slice(count / 2, count));
    rightPnts.push(neckRight);

    leftPnts = P.PlotUtils.getQBSplinePoints(leftPnts);
    rightPnts = P.PlotUtils.getQBSplinePoints(rightPnts);

    this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse(), [tailPnts[1], leftPnts[0]])]);
};

P.Plot.TailedSquadCombat.prototype.getTailPoints = function (points) {
    var allLen = P.PlotUtils.getBaseLength(points);
    var tailWidth = allLen * this.tailWidthFactor;
    var tailLeft = P.PlotUtils.getThirdPoint(points[1], points[0], P.Constants.HALF_PI, tailWidth, false);
    var tailRight = P.PlotUtils.getThirdPoint(points[1], points[0], P.Constants.HALF_PI, tailWidth, true);
    var len = tailWidth * this.swallowTailFactor;
    var swallowTailPnt = P.PlotUtils.getThirdPoint(points[1], points[0], 0, len, true);
    return [tailLeft, swallowTailPnt, tailRight];
};

P.Plot.Circle = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.CIRCLE;
    this.fixPointCount = 2;
    this.setPoints(points);
}

goog.inherits(P.Plot.Circle, ol.geom.Polygon);
goog.mixin(P.Plot.Circle.prototype, P.Plot.prototype);

P.Plot.Circle.prototype.generate = function(){
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    var center = this.points[0];
    var radius = P.PlotUtils.distance(center, this.points[1]);
    this.setCoordinates([this.generatePoints(center, radius)]);
};

P.Plot.Circle.prototype.generatePoints = function(center, radius){
    var x, y, angle, points=[];
    for(var i=0; i<= P.Constants.FITTING_COUNT; i++){
        angle = Math.PI*2*i/ P.Constants.FITTING_COUNT;
        x = center[0] + radius*Math.cos(angle);
        y = center[1] + radius*Math.sin(angle);
        points.push([x,y]);
    }
    return points;
};



P.Plot.ClosedCurve = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.CLOSED_CURVE;
    this.t = 0.3;
    this.setPoints(points);
};

goog.inherits(P.Plot.ClosedCurve, ol.geom.Polygon);
goog.mixin(P.Plot.ClosedCurve.prototype, P.Plot.prototype);

P.Plot.ClosedCurve.prototype.generate = function(){
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    if(count == 2) {
        this.setCoordinates([this.points]);
    }
    else{
        var pnts = this.getPoints();
        pnts.push(pnts[0], pnts[1]);
        var normals = [];
        for(var i=0; i<pnts.length-2; i++){
            var normalPoints = P.PlotUtils.getBisectorNormals(this.t, pnts[i], pnts[i+1], pnts[i+2]);
            normals = normals.concat(normalPoints);
        }
        var count = normals.length;
        normals = [normals[count-1]].concat(normals.slice(0, count-1));

        var pList = [];
        for(i=0; i<pnts.length-2; i++){
            var pnt1 = pnts[i];
            var pnt2 = pnts[i+1];
            pList.push(pnt1);
            for(var t=0; t<= P.Constants.FITTING_COUNT; t++){
                var pnt = P.PlotUtils.getCubicValue(t/ P.Constants.FITTING_COUNT, pnt1, normals[i*2], normals[i*2+1], pnt2);
                pList.push(pnt);
            }
            pList.push(pnt2);
        }
        this.setCoordinates([pList]);
    }
};

P.Plot.Curve = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.CURVE;
    this.t = 0.3;
    this.setPoints(points);
};

goog.inherits(P.Plot.Curve, ol.geom.LineString);
goog.mixin(P.Plot.Curve.prototype, P.Plot.prototype);

P.Plot.Curve.prototype.generate = function(){
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    if(count == 2) {
        this.setCoordinates(this.points);
    } else {
        this.setCoordinates(P.PlotUtils.getCurvePoints(this.t, this.points));
    }
};

P.Plot.DoubleArrow = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.DOUBLE_ARROW;
    this.headHeightFactor = 0.25;
    this.headWidthFactor = 0.3;
    this.neckHeightFactor = 0.85;
    this.neckWidthFactor = 0.15;
    this.connPoint = null;
    this.tempPoint4 = null;
    this.fixPointCount = 4;
    this.setPoints(points);
};

goog.inherits(P.Plot.DoubleArrow, ol.geom.Polygon);
goog.mixin(P.Plot.DoubleArrow.prototype, P.Plot.prototype);

P.Plot.DoubleArrow.prototype.finishDrawing = function(){
    if(this.getPointCount()==3 && this.tempPoint4!=null)
        this.points.push(this.tempPoint4);
    if(this.connPoint!=null)
        this.points.push(this.connPoint);
};

P.Plot.DoubleArrow.prototype.generate = function(){
    var count = this.getPointCount();
    if(count<2) {
        return;
    }
    if(count == 2){
        this.setCoordinates([this.points]);
        return;
    }
    var pnt1 = this.points[0];
    var pnt2 = this.points[1];
    var pnt3 = this.points[2];
    var count = this.getPointCount();
    if(count == 3)
        this.tempPoint4 = this.getTempPoint4(pnt1, pnt2, pnt3);
    else
        this.tempPoint4 = this.points[3];
    if(count==3 || count==4)
        this.connPoint = P.PlotUtils.mid(pnt1, pnt2);
    else
        this.connPoint = this.points[4];
    var leftArrowPnts, rightArrowPnts;
    if(P.PlotUtils.isClockWise(pnt1, pnt2, pnt3)){
        leftArrowPnts = this.getArrowPoints(pnt1, this.connPoint, this.tempPoint4, false);
        rightArrowPnts = this.getArrowPoints(this.connPoint, pnt2, pnt3, true);
    }else{
        leftArrowPnts = this.getArrowPoints(pnt2, this.connPoint, pnt3, false);
        rightArrowPnts = this.getArrowPoints(this.connPoint, pnt1, this.tempPoint4, true);
    }
    var m = leftArrowPnts.length;
    var t = (m - 5) / 2;

    var llBodyPnts = leftArrowPnts.slice(0 ,t);
    var lArrowPnts = leftArrowPnts.slice(t, t+5);
    var lrBodyPnts = leftArrowPnts.slice(t+5, m);

    var rlBodyPnts = rightArrowPnts.slice(0 ,t);
    var rArrowPnts = rightArrowPnts.slice(t, t+5);
    var rrBodyPnts = rightArrowPnts.slice(t+5, m);

    rlBodyPnts = P.PlotUtils.getBezierPoints(rlBodyPnts);
    var bodyPnts = P.PlotUtils.getBezierPoints(rrBodyPnts.concat(llBodyPnts.slice(1)));
    lrBodyPnts = P.PlotUtils.getBezierPoints(lrBodyPnts);

    var pnts = rlBodyPnts.concat(rArrowPnts, bodyPnts, lArrowPnts, lrBodyPnts);
    this.setCoordinates([pnts]);
};

P.Plot.DoubleArrow.prototype.getArrowPoints = function(pnt1, pnt2, pnt3, clockWise){
    var midPnt=P.PlotUtils.mid(pnt1, pnt2);
    var len=P.PlotUtils.distance(midPnt, pnt3);
    var midPnt1=P.PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
    var midPnt2=P.PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
    //var midPnt3=PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.7, true);
    midPnt1=P.PlotUtils.getThirdPoint(midPnt, midPnt1, P.Constants.HALF_PI, len / 5, clockWise);
    midPnt2=P.PlotUtils.getThirdPoint(midPnt, midPnt2, P.Constants.HALF_PI, len / 4, clockWise);
    //midPnt3=PlotUtils.getThirdPoint(midPnt, midPnt3, Constants.HALF_PI, len / 5, clockWise);

    var points=[midPnt, midPnt1, midPnt2, pnt3];
    // 计算箭头部分
    var arrowPnts=this.getArrowHeadPoints(points, this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor, this.neckWidthFactor);
    var neckLeftPoint=arrowPnts[0];
    var neckRightPoint=arrowPnts[4];
    // 计算箭身部分
    var tailWidthFactor=P.PlotUtils.distance(pnt1, pnt2) / P.PlotUtils.getBaseLength(points) / 2;
    var bodyPnts=this.getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);
    var n=bodyPnts.length;
    var lPoints=bodyPnts.slice(0, n / 2);
    var rPoints=bodyPnts.slice(n / 2, n);
    lPoints.push(neckLeftPoint);
    rPoints.push(neckRightPoint);
    lPoints=lPoints.reverse();
    lPoints.push(pnt2);
    rPoints=rPoints.reverse();
    rPoints.push(pnt1);
    return lPoints.reverse().concat(arrowPnts, rPoints);
};

P.Plot.DoubleArrow.prototype.getArrowHeadPoints = function(points, tailLeft, tailRight){
    var len = P.PlotUtils.getBaseLength(points);
    var headHeight = len * this.headHeightFactor;
    var headPnt = points[points.length-1];
    var tailWidth = P.PlotUtils.distance(tailLeft, tailRight);
    var headWidth = headHeight * this.headWidthFactor;
    var neckWidth = headHeight * this.neckWidthFactor;
    var neckHeight = headHeight * this.neckHeightFactor;
    var headEndPnt = P.PlotUtils.getThirdPoint(points[points.length-2], headPnt, 0, headHeight, true);
    var neckEndPnt = P.PlotUtils.getThirdPoint(points[points.length-2], headPnt, 0, neckHeight, true);
    var headLeft = P.PlotUtils.getThirdPoint(headPnt, headEndPnt, P.Constants.HALF_PI, headWidth, false);
    var headRight = P.PlotUtils.getThirdPoint(headPnt, headEndPnt, P.Constants.HALF_PI, headWidth, true);
    var neckLeft = P.PlotUtils.getThirdPoint(headPnt, neckEndPnt, P.Constants.HALF_PI, neckWidth, false);
    var neckRight = P.PlotUtils.getThirdPoint(headPnt, neckEndPnt, P.Constants.HALF_PI, neckWidth, true);
    return [neckLeft, headLeft, headPnt, headRight, neckRight];
};

P.Plot.DoubleArrow.prototype.getArrowBodyPoints = function(points, neckLeft, neckRight, tailWidthFactor){
    var allLen = P.PlotUtils.wholeDistance(points);
    var len = P.PlotUtils.getBaseLength(points);
    var tailWidth = len * tailWidthFactor;
    var neckWidth = P.PlotUtils.distance(neckLeft, neckRight);
    var widthDif = (tailWidth - neckWidth) / 2;
    var tempLen = 0, leftBodyPnts=[], rightBodyPnts = [];
    for(var i=1; i<points.length-1; i++){
        var angle=P.PlotUtils.getAngleOfThreePoints(points[i-1], points[i], points[i+1]) / 2;
        tempLen += P.PlotUtils.distance(points[i-1], points[i]);
        var w = (tailWidth/2 - tempLen / allLen * widthDif) / Math.sin(angle);
        var left = P.PlotUtils.getThirdPoint(points[i-1], points[i], Math.PI-angle, w, true);
        var right = P.PlotUtils.getThirdPoint(points[i-1], points[i], angle, w, false);
        leftBodyPnts.push(left);
        rightBodyPnts.push(right);
    }
    return leftBodyPnts.concat(rightBodyPnts);
};

// 计算对称点
P.Plot.DoubleArrow.prototype.getTempPoint4 = function(linePnt1, linePnt2, point){
    var midPnt=P.PlotUtils.mid(linePnt1, linePnt2);
    var len=P.PlotUtils.distance(midPnt, point);
    var angle=P.PlotUtils.getAngleOfThreePoints(linePnt1, midPnt, point);
    var symPnt, distance1, distance2, mid;
    if (angle < P.Constants.HALF_PI)
    {
        distance1=len * Math.sin(angle);
        distance2=len * Math.cos(angle);
        mid=P.PlotUtils.getThirdPoint(linePnt1, midPnt, P.Constants.HALF_PI, distance1, false);
        symPnt=P.PlotUtils.getThirdPoint(midPnt, mid, P.Constants.HALF_PI, distance2, true);
    }
    else if (angle >= P.Constants.HALF_PI && angle < Math.PI)
    {
        distance1=len * Math.sin(Math.PI - angle);
        distance2=len * Math.cos(Math.PI - angle);
        mid=P.PlotUtils.getThirdPoint(linePnt1, midPnt, P.Constants.HALF_PI, distance1, false);
        symPnt=P.PlotUtils.getThirdPoint(midPnt, mid, P.Constants.HALF_PI, distance2, false);
    }
    else if (angle >= Math.PI && angle < Math.PI * 1.5)
    {
        distance1=len * Math.sin(angle - Math.PI);
        distance2=len * Math.cos(angle - Math.PI);
        mid=P.PlotUtils.getThirdPoint(linePnt1, midPnt, P.Constants.HALF_PI, distance1, true);
        symPnt=P.PlotUtils.getThirdPoint(midPnt, mid, P.Constants.HALF_PI, distance2, true);
    }
    else
    {
        distance1=len * Math.sin(Math.PI * 2 - angle);
        distance2=len * Math.cos(Math.PI * 2 - angle);
        mid=P.PlotUtils.getThirdPoint(linePnt1, midPnt, P.Constants.HALF_PI, distance1, true);
        symPnt=P.PlotUtils.getThirdPoint(midPnt, mid, P.Constants.HALF_PI, distance2, false);
    }
    return symPnt;
};


P.Plot.Ellipse = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.ELLIPSE;
    this.fixPointCount = 2;
    this.setPoints(points);
};

goog.inherits(P.Plot.Ellipse, ol.geom.Polygon);
goog.mixin(P.Plot.Ellipse.prototype, P.Plot.prototype);

P.Plot.Ellipse.prototype.generate = function(){
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    var pnt1 = this.points[0];
    var pnt2 = this.points[1];
    var center = P.PlotUtils.mid(pnt1, pnt2);
    var majorRadius = Math.abs((pnt1[0]-pnt2[0])/2);
    var minorRadius = Math.abs((pnt1[1]-pnt2[1])/2);
    this.setCoordinates([this.generatePoints(center, majorRadius, minorRadius)]);
};

P.Plot.Ellipse.prototype.generatePoints = function(center, majorRadius, minorRadius) {
    var x, y, angle, points = [];
    for (var i = 0; i <= P.Constants.FITTING_COUNT; i++) {
        angle = Math.PI * 2 * i / P.Constants.FITTING_COUNT;
        x = center[0] + majorRadius * Math.cos(angle);
        y = center[1] + minorRadius * Math.sin(angle);
        points.push([x, y]);
    }
    return points;
};



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

P.Plot.AssaultDirection = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.ASSAULT_DIRECTION;
    this.tailWidthFactor = 0.2;
    this.neckWidthFactor = 0.25;
    this.headWidthFactor = 0.3;
    this.headAngle = Math.PI / 4;
    this.neckAngle = Math.PI * 0.17741;
    this.setPoints(points);
};

goog.inherits(P.Plot.AssaultDirection, P.Plot.FineArrow);

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

P.Plot.Sector = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.SECTOR;
    this.fixPointCount = 3;
    this.setPoints(points);
};

goog.inherits(P.Plot.Sector, ol.geom.Polygon);
goog.mixin(P.Plot.Sector.prototype, P.Plot.prototype);

P.Plot.Sector.prototype.generate = function(){
    if(this.getPointCount()<2)
        return;
    if(this.getPointCount()==2)
        this.setCoordinates([this.points]);
    else{
        var pnts = this.getPoints();
        var center = pnts[0];
        var pnt2 = pnts[1];
        var pnt3 = pnts[2];
        var radius = P.PlotUtils.distance(pnt2, center);
        var startAngle = P.PlotUtils.getAzimuth(pnt2, center);
        var endAngle = P.PlotUtils.getAzimuth(pnt3, center);
        var pList = P.PlotUtils.getArcPoints(center, radius, startAngle, endAngle);
        pList.push(center, pList[0]);
        this.setCoordinates([pList]);
    }
};

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

P.Plot.Polyline = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.POLYLINE;
    this.setPoints(points);
};

goog.inherits(P.Plot.Polyline, ol.geom.LineString);
goog.mixin(P.Plot.Polyline.prototype, P.Plot.prototype);

P.Plot.Polyline.prototype.generate = function(){
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    this.setCoordinates(this.points);
};

P.Plot.FreehandLine = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.FREEHAND_LINE;
    this.freehand =  true;
    this.setPoints(points);
};

goog.inherits(P.Plot.FreehandLine, ol.geom.LineString);
goog.mixin(P.Plot.FreehandLine.prototype, P.Plot.prototype);

P.Plot.FreehandLine.prototype.generate = function(){
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    this.setCoordinates(this.points);
};

P.Plot.Polygon = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.POLYGON;
    this.setPoints(points);
};

goog.inherits(P.Plot.Polygon, ol.geom.Polygon);
goog.mixin(P.Plot.Polygon.prototype, P.Plot.prototype);

P.Plot.Polygon.prototype.generate = function() {
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    this.setCoordinates([this.points]);
};

P.Plot.Marker = function(points){
    goog.base(this, [0,0]);
    this.type = P.PlotTypes.MARKER;
    this.fixPointCount = 1;
    this.setPoints(points);
}

goog.inherits(P.Plot.Marker, ol.geom.Point);
goog.mixin(P.Plot.Marker.prototype, P.Plot.prototype);

P.Plot.Marker.prototype.generate = function(){
    var pnt = this.points[0];
    this.setCoordinates(pnt);
};



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

P.Plot.FreehandPolygon = function(points){
    goog.base(this, []);
    this.type = P.PlotTypes.FREEHAND_POLYGON;
    this.freehand = true;
    this.setPoints(points);
};

goog.inherits(P.Plot.FreehandPolygon, ol.geom.Polygon);
goog.mixin(P.Plot.FreehandPolygon.prototype, P.Plot.prototype);

P.Plot.FreehandPolygon.prototype.generate = function() {
    var count = this.getPointCount();
    if(count < 2) {
        return;
    }
    this.setCoordinates([this.points]);
};

P.PlotFactory = {};

P.PlotFactory.createPlot = function(type, points){
    switch(type){
        case P.PlotTypes.ARC:
            return new P.Plot.Arc(points);
        case P.PlotTypes.ELLIPSE:
            return new P.Plot.Ellipse(points);
        case P.PlotTypes.CURVE:
            return new P.Plot.Curve(points);
        case P.PlotTypes.CLOSED_CURVE:
            return new P.Plot.ClosedCurve(points);
        case P.PlotTypes.LUNE:
            return new P.Plot.Lune(points);
        case P.PlotTypes.SECTOR:
            return new P.Plot.Sector(points);
        case P.PlotTypes.GATHERING_PLACE:
            return new P.Plot.GatheringPlace(points);
        case P.PlotTypes.STRAIGHT_ARROW:
            return new P.Plot.StraightArrow(points);
        case P.PlotTypes.ASSAULT_DIRECTION:
            return new P.Plot.AssaultDirection(points);
        case P.PlotTypes.ATTACK_ARROW:
            return new P.Plot.AttackArrow(points);
        case P.PlotTypes.FINE_ARROW:
            return new P.Plot.FineArrow(points);
        case P.PlotTypes.CIRCLE:
            return new P.Plot.Circle(points);
        case P.PlotTypes.DOUBLE_ARROW:
            return new P.Plot.DoubleArrow(points);
        case P.PlotTypes.TAILED_ATTACK_ARROW:
            return new P.Plot.TailedAttackArrow(points);
        case P.PlotTypes.SQUAD_COMBAT:
            return new P.Plot.SquadCombat(points);
        case P.PlotTypes.TAILED_SQUAD_COMBAT:
            return new P.Plot.TailedSquadCombat(points);
        case P.PlotTypes.FREEHAND_LINE:
            return new P.Plot.FreehandLine(points);
        case P.PlotTypes.FREEHAND_POLYGON:
            return new P.Plot.FreehandPolygon(points);
        case P.PlotTypes.POLYGON:
            return new P.Plot.Polygon(points);
        case P.PlotTypes.MARKER:
            return new P.Plot.Marker(points);
        case P.PlotTypes.RECTANGLE:
            return new P.Plot.Rectangle(points);
        case P.PlotTypes.POLYLINE:
            return new P.Plot.Polyline(points);
    }
    return null;
}

P.PlotDraw = function(map){
    goog.base(this, []);
    this.points = null;
    this.plot = null;
    this.feature = null;
    this.plotType = null;
    this.plotParams = null;
    this.mapViewport = null;
    this.dblClickZoomInteraction = null;
    var stroke = new ol.style.Stroke({color: '#000000', width: 1.25});
    var fill = new ol.style.Fill({color: 'rgba(0,0,0,0.4)'});
    this.style = new ol.style.Style({fill:fill, stroke:stroke});
    this.featureSource = new ol.source.Vector();
    this.drawOverlay = new ol.layer.Vector({
        source: this.featureSource
    });
    this.drawOverlay.setStyle(this.style);
    this.setMap(map);
};

goog.inherits(P.PlotDraw, ol.Observable);

P.PlotDraw.prototype.activate = function (type, params) {
    this.deactivate();
    this.deactivateMapTools();
    map.on("click", this.mapFirstClickHandler, this);
    this.plotType = type;
    this.plotParams = params;
    this.map.addLayer(this.drawOverlay);
};

P.PlotDraw.prototype.deactivate = function () {
    this.disconnectEventHandlers();
    this.map.removeLayer(this.drawOverlay);
    this.featureSource.clear();
    this.points = [];
    this.plot = null;
    this.feature = null;
    this.plotType = null;
    this.plotParams = null;
    this.activateMapTools();
};

P.PlotDraw.prototype.isDrawing = function(){
    return this.plotType != null;
};

P.PlotDraw.prototype.setMap = function (value) {
    this.map = value;
    this.mapViewport = this.map.getViewport();
};

P.PlotDraw.prototype.mapFirstClickHandler = function (e) {
    this.points.push(e.coordinate);
    this.plot = P.PlotFactory.createPlot(this.plotType, this.points, this.plotParams);
    this.feature = new ol.Feature(this.plot);
    this.featureSource.addFeature(this.feature);
    this.map.un("click", this.mapFirstClickHandler, this);
    //
    if (this.plot.fixPointCount == this.plot.getPointCount()) {
        this.mapDoubleClickHandler(e);
        return;
    }
    //
    this.map.on("click", this.mapNextClickHandler, this);
    if(!this.plot.freehand){
        this.map.on("dblclick", this.mapDoubleClickHandler, this);
    }
    goog.events.listen(this.mapViewport, P.Event.EventType.MOUSEMOVE,
        this.mapMouseMoveHandler, false, this);
};

P.PlotDraw.prototype.mapMouseMoveHandler = function (e) {
    var coordinate = map.getCoordinateFromPixel([e.offsetX, e.offsetY]);
    if (P.PlotUtils.distance(coordinate, this.points[this.points.length - 1]) < P.Constants.ZERO_TOLERANCE)
        return;
    if(!this.plot.freehand){
        var pnts = this.points.concat([coordinate]);
        this.plot.setPoints(pnts);
    }else{
        this.points.push(coordinate);
        this.plot.setPoints(this.points);
    }
};

P.PlotDraw.prototype.mapNextClickHandler = function (e) {
    if(!this.plot.freehand){
        if (P.PlotUtils.distance(e.coordinate, this.points[this.points.length - 1]) < P.Constants.ZERO_TOLERANCE)
            return;
    }
    this.points.push(e.coordinate);
    this.plot.setPoints(this.points);
    if (this.plot.fixPointCount == this.plot.getPointCount()) {
        this.mapDoubleClickHandler(e);
        return;
    }
    if(this.plot && this.plot.freehand){
        this.mapDoubleClickHandler(e);
    }
};

P.PlotDraw.prototype.mapDoubleClickHandler = function (e) {
    this.disconnectEventHandlers();
    this.plot.finishDrawing();
    e.preventDefault();
    this.drawEnd();
};

P.PlotDraw.prototype.disconnectEventHandlers = function () {
    this.map.un("click", this.mapFirstClickHandler, this);
    this.map.un("click", this.mapNextClickHandler, this);
    goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEMOVE,
        this.mapMouseMoveHandler, false, this);
    this.map.un("dblclick", this.mapDoubleClickHandler, this);
};

P.PlotDraw.prototype.drawEnd = function (feature) {
    this.featureSource.removeFeature(this.feature);
    this.activateMapTools();
    this.disconnectEventHandlers();
    this.map.removeOverlay(this.drawOverlay);
    this.points = [];
    this.plot = null;
    this.plotType = null;
    this.plotParams = null;
    this.dispatchEvent(new P.Event.PlotDrawEvent(P.Event.PlotDrawEvent.DRAW_END, this.feature));
    this.feature = null;
};

P.PlotDraw.prototype.deactivateMapTools = function () {
    var interactions = map.getInteractions();
    var length = interactions.getLength();
    for (var i = 0; i < length; i++) {
        var item = interactions.item(i);
        if (item instanceof ol.interaction.DoubleClickZoom) {
            this.dblClickZoomInteraction = item;
            interactions.remove(item);
            break;
        }
    }
};

P.PlotDraw.prototype.activateMapTools = function () {
    if (this.dblClickZoomInteraction != null) {
        map.getInteractions().push(this.dblClickZoomInteraction);
        this.dblClickZoomInteraction = null;
    }
};

P.PlotEdit = function(map){
    if(!map){
        return;
    }
    goog.base(this, []);
    this.activePlot = null;
    this.startPoint = null;
    this.ghostControlPoints = null;
    this.controlPoints = null;
    this.map = map;
    this.mapViewport = this.map.getViewport();
    this.mouseOver = false;
    this.elementTable = {};
    this.activeControlPointId = null;
    this.mapDragPan = null;
};

goog.inherits(P.PlotEdit, ol.Observable);

P.PlotEdit.prototype.Constants = {
    HELPER_HIDDEN_DIV: 'p-helper-hidden-div',
    HELPER_CONTROL_POINT_DIV: 'p-helper-control-point-div'
};

P.PlotEdit.prototype.initHelperDom = function(){
    if(!this.map || !this.activePlot){
        return;
    }
    var parent = this.getMapParentElement();
    if(!parent){
       return;
    }
    var hiddenDiv = P.DomUtils.createHidden('div', parent, this.Constants.HELPER_HIDDEN_DIV);

    var cPnts = this.getControlPoints();
    for(var i=0; i<cPnts.length; i++){
        var id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i;
        P.DomUtils.create('div', this.Constants.HELPER_CONTROL_POINT_DIV, hiddenDiv, id);
        this.elementTable[id] = i;
    }
};

P.PlotEdit.prototype.getMapParentElement = function() {
    var mapElement = this.map.getTargetElement();
    if(!mapElement){
        return;
    }
    return mapElement.parentNode;
};

P.PlotEdit.prototype.destroyHelperDom = function(){
    //
    if(this.controlPoints){
        for(var i=0; i<this.controlPoints.length; i++){
            this.map.removeOverlay(this.controlPoints[i]);
            var element = P.DomUtils.get(this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i);
            if(element){
                P.DomUtils.removeListener(element, 'mousedown', this.controlPointMouseDownHandler, this);
                P.DomUtils.removeListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this);
            }
        }
        this.controlPoints = null;
    }
    //
    var parent = this.getMapParentElement();
    var hiddenDiv = P.DomUtils.get(this.Constants.HELPER_HIDDEN_DIV);
    if(hiddenDiv && parent){
        P.DomUtils.remove(hiddenDiv, parent);
    }
};

P.PlotEdit.prototype.initControlPoints = function(){
    if(!this.map){
        return;
    }
    this.controlPoints = [];
    var cPnts = this.getControlPoints();
    for(var i=0; i<cPnts.length; i++){
        var id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i;
        var element = P.DomUtils.get(id);
        var pnt = new ol.Overlay({
            id: id,
            position: cPnts[i],
            positioning: 'center-center',
            element: element
        });
        this.controlPoints.push(pnt);
        this.map.addOverlay(pnt);
        P.DomUtils.addListener(element, 'mousedown', this.controlPointMouseDownHandler, this);
        P.DomUtils.addListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this);
    }
};

P.PlotEdit.prototype.controlPointMouseMoveHandler2 = function(e){
    e.stopImmediatePropagation();
};

P.PlotEdit.prototype.controlPointMouseDownHandler = function(e){
    var id = e.target.id;
    this.activeControlPointId = id;
    goog.events.listen(this.mapViewport, P.Event.EventType.MOUSEMOVE, this.controlPointMouseMoveHandler, false, this);
    goog.events.listen(this.mapViewport, P.Event.EventType.MOUSEUP, this.controlPointMouseUpHandler, false, this);
};

P.PlotEdit.prototype.controlPointMouseMoveHandler = function(e){
    var coordinate = map.getCoordinateFromPixel([e.offsetX, e.offsetY]);
    if(this.activeControlPointId){
        var plot = this.activePlot.getGeometry();
        var index = this.elementTable[this.activeControlPointId];
        plot.updatePoint(coordinate, index);
        var overlay = this.map.getOverlayById(this.activeControlPointId);
        overlay.setPosition(coordinate);
    }
};

P.PlotEdit.prototype.controlPointMouseUpHandler = function(e){
    goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEMOVE,
        this.controlPointMouseMoveHandler, false, this);
    goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEUP,
        this.controlPointMouseUpHandler, false, this);
};

P.PlotEdit.prototype.activate = function(plot){

    if(!plot || !(plot instanceof ol.Feature) || plot == this.activePlot) {
        return;
    }

    var geom = plot.getGeometry();
    if(!geom.isPlot()){
        return;
    }

    this.deactivate();

    this.activePlot = plot;
    //
    this.map.on("pointermove", this.plotMouseOverOutHandler, this);
    
    this.initHelperDom();
    //
    this.initControlPoints();
    //
};

P.PlotEdit.prototype.getControlPoints = function(){
    if(!this.activePlot){
        return [];
    }
    var geom = this.activePlot.getGeometry();
    return geom.getPoints();
};

P.PlotEdit.prototype.plotMouseOverOutHandler = function(e){
    var feature = map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        return feature;
    });
    if(feature && feature == this.activePlot){
        if(!this.mouseOver){
            this.mouseOver = true;
            this.map.getViewport().style.cursor = 'move';
            this.map.on('pointerdown', this.plotMouseDownHandler, this);
        }
    }else{
        if(this.mouseOver){
            this.mouseOver = false;
            this.map.getViewport().style.cursor = 'default';
            this.map.un('pointerdown', this.plotMouseDownHandler, this);
        }
    }
};

P.PlotEdit.prototype.plotMouseDownHandler = function(e){
    this.ghostControlPoints = this.getControlPoints();
    this.startPoint = e.coordinate;
    this.disableMapDragPan();
    this.map.on('pointerup', this.plotMouseUpHandler, this);
    this.map.on('pointerdrag', this.plotMouseMoveHandler, this);
};

P.PlotEdit.prototype.plotMouseMoveHandler = function(e){
    var point = e.coordinate;
    var dx = point[0] - this.startPoint[0];
    var dy = point[1] - this.startPoint[1];
    var newPoints = [];
    for(var i=0; i<this.ghostControlPoints.length; i++){
        var p = this.ghostControlPoints[i];
        var coordinate = [p[0] + dx, p[1] + dy];
        newPoints.push(coordinate);
        var id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i;
        var overlay = this.map.getOverlayById(id);
        overlay.setPosition(coordinate);
        overlay.setPositioning('center-center');
    }
    var plot = this.activePlot.getGeometry();
    plot.setPoints(newPoints);
};

P.PlotEdit.prototype.plotMouseUpHandler = function(e){
    this.enableMapDragPan();
    this.map.un('pointerup', this.plotMouseUpHandler, this);
    this.map.un('pointerdrag', this.plotMouseMoveHandler, this);
};

P.PlotEdit.prototype.disconnectEventHandlers = function () {
    this.map.un('pointermove', this.plotMouseOverOutHandler, this);
    goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEMOVE,
        this.controlPointMouseMoveHandler, false, this);
    goog.events.unlisten(this.mapViewport, P.Event.EventType.MOUSEUP,
        this.controlPointMouseUpHandler, false, this);
    this.map.un('pointerdown', this.plotMouseDownHandler, this);
    this.map.un('pointerup', this.plotMouseUpHandler, this);
    this.map.un('pointerdrag', this.plotMouseMoveHandler, this);
};

P.PlotEdit.prototype.deactivate = function(){
    this.activePlot = null;
    this.mouseOver = false;
    this.destroyHelperDom();
    this.disconnectEventHandlers();
    this.elementTable = {};
    this.activeControlPointId = null;
    this.startPoint = null;
};

P.PlotEdit.prototype.disableMapDragPan = function () {
    var interactions = this.map.getInteractions();
    var length = interactions.getLength();
    for (var i = 0; i < length; i++) {
        var item = interactions.item(i);
        if (item instanceof ol.interaction.DragPan) {
            this.mapDragPan = item;
            item.setActive(false);
            break;
        }
    }
};

P.PlotEdit.prototype.enableMapDragPan = function () {
    if (this.mapDragPan != null) {
        this.mapDragPan.setActive(true);
        this.mapDragPan = null;
    }
};