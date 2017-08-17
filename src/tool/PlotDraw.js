
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