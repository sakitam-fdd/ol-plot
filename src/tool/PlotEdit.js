
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