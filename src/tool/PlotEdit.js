olPlot.PlotEdit = function (map) {
  if (!map) {
    return;
  }
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
  olPlot.Event.Observable.call(this)
};

olPlot.Utils.inherits(olPlot.PlotEdit, olPlot.Event.Observable);

olPlot.PlotEdit.prototype.Constants = {
  HELPER_HIDDEN_DIV: 'olPlot-helper-hidden-div',
  HELPER_CONTROL_POINT_DIV: 'olPlot-helper-control-point-div'
};

olPlot.PlotEdit.prototype.initHelperDom = function () {
  if (!this.map || !this.activePlot) {
    return;
  }
  var parent = this.getMapParentElement();
  if (!parent) {
    return;
  }
  var hiddenDiv = olPlot.DomUtils.createHidden('div', parent, this.Constants.HELPER_HIDDEN_DIV);

  var cPnts = this.getControlPoints();
  for (var i = 0; i < cPnts.length; i++) {
    var id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i;
    olPlot.DomUtils.create('div', this.Constants.HELPER_CONTROL_POINT_DIV, hiddenDiv, id);
    this.elementTable[id] = i;
  }
};

olPlot.PlotEdit.prototype.getMapParentElement = function () {
  var mapElement = this.map.getTargetElement();
  if (!mapElement) {
    return;
  }
  return mapElement.parentNode;
};

olPlot.PlotEdit.prototype.destroyHelperDom = function () {
  //
  if (this.controlPoints) {
    for (var i = 0; i < this.controlPoints.length; i++) {
      this.map.removeOverlay(this.controlPoints[i]);
      var element = olPlot.DomUtils.get(this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i);
      if (element) {
        olPlot.DomUtils.removeListener(element, 'mousedown', this.controlPointMouseDownHandler, this);
        olPlot.DomUtils.removeListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this);
      }
    }
    this.controlPoints = null;
  }
  //
  var parent = this.getMapParentElement();
  var hiddenDiv = olPlot.DomUtils.get(this.Constants.HELPER_HIDDEN_DIV);
  if (hiddenDiv && parent) {
    olPlot.DomUtils.remove(hiddenDiv, parent);
  }
};

olPlot.PlotEdit.prototype.initControlPoints = function () {
  if (!this.map) {
    return;
  }
  this.controlPoints = [];
  var cPnts = this.getControlPoints();
  for (var i = 0; i < cPnts.length; i++) {
    var id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i;
    var element = olPlot.DomUtils.get(id);
    var pnt = new ol.Overlay({
      id: id,
      position: cPnts[i],
      positioning: 'center-center',
      element: element
    });
    this.controlPoints.push(pnt);
    this.map.addOverlay(pnt);
    olPlot.DomUtils.addListener(element, 'mousedown', this.controlPointMouseDownHandler, this);
    olPlot.DomUtils.addListener(element, 'mousemove', this.controlPointMouseMoveHandler2, this);
  }
};

olPlot.PlotEdit.prototype.controlPointMouseMoveHandler2 = function (e) {
  e.stopImmediatePropagation();
};

olPlot.PlotEdit.prototype.controlPointMouseDownHandler = function (e) {
  var id = e.target.id;
  this.activeControlPointId = id;
  olPlot.Event.listen(this.mapViewport, olPlot.Event.EventType.MOUSEMOVE, this.controlPointMouseMoveHandler, this);
  olPlot.Event.listen(this.mapViewport, olPlot.Event.EventType.MOUSEUP, this.controlPointMouseUpHandler, this);
};

olPlot.PlotEdit.prototype.controlPointMouseMoveHandler = function (e) {
  var coordinate = this.map.getCoordinateFromPixel([e.offsetX, e.offsetY]);
  if (this.activeControlPointId) {
    var plot = this.activePlot.getGeometry();
    var index = this.elementTable[this.activeControlPointId];
    plot.updatePoint(coordinate, index);
    var overlay = this.map.getOverlayById(this.activeControlPointId);
    overlay.setPosition(coordinate);
  }
};

olPlot.PlotEdit.prototype.controlPointMouseUpHandler = function (e) {
  olPlot.Event.unListen(this.mapViewport, olPlot.Event.EventType.MOUSEMOVE,
    this.controlPointMouseMoveHandler, this);
  olPlot.Event.unListen(this.mapViewport, olPlot.Event.EventType.MOUSEUP,
    this.controlPointMouseUpHandler, this);
};

olPlot.PlotEdit.prototype.activate = function (plot) {

  if (!plot || !(plot instanceof ol.Feature) || plot == this.activePlot) {
    return;
  }

  var geom = plot.getGeometry();
  if (!geom.isPlot()) {
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

olPlot.PlotEdit.prototype.getControlPoints = function () {
  if (!this.activePlot) {
    return [];
  }
  var geom = this.activePlot.getGeometry();
  return geom.getPoints();
};

olPlot.PlotEdit.prototype.plotMouseOverOutHandler = function (e) {
  var feature = this.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
    return feature;
  });
  if (feature && feature == this.activePlot) {
    if (!this.mouseOver) {
      this.mouseOver = true;
      this.map.getViewport().style.cursor = 'move';
      this.map.on('pointerdown', this.plotMouseDownHandler, this);
    }
  } else {
    if (this.mouseOver) {
      this.mouseOver = false;
      this.map.getViewport().style.cursor = 'default';
      this.map.un('pointerdown', this.plotMouseDownHandler, this);
    }
  }
};

olPlot.PlotEdit.prototype.plotMouseDownHandler = function (e) {
  this.ghostControlPoints = this.getControlPoints();
  this.startPoint = e.coordinate;
  this.disableMapDragPan();
  this.map.on('pointerup', this.plotMouseUpHandler, this);
  this.map.on('pointerdrag', this.plotMouseMoveHandler, this);
};

olPlot.PlotEdit.prototype.plotMouseMoveHandler = function (e) {
  var point = e.coordinate;
  var dx = point[0] - this.startPoint[0];
  var dy = point[1] - this.startPoint[1];
  var newPoints = [];
  for (var i = 0; i < this.ghostControlPoints.length; i++) {
    var olPlot = this.ghostControlPoints[i];
    var coordinate = [olPlot[0] + dx, olPlot[1] + dy];
    newPoints.push(coordinate);
    var id = this.Constants.HELPER_CONTROL_POINT_DIV + '-' + i;
    var overlay = this.map.getOverlayById(id);
    overlay.setPosition(coordinate);
    overlay.setPositioning('center-center');
  }
  var plot = this.activePlot.getGeometry();
  plot.setPoints(newPoints);
};

olPlot.PlotEdit.prototype.plotMouseUpHandler = function (e) {
  this.enableMapDragPan();
  this.map.un('pointerup', this.plotMouseUpHandler, this);
  this.map.un('pointerdrag', this.plotMouseMoveHandler, this);
};

olPlot.PlotEdit.prototype.disconnectEventHandlers = function () {
  this.map.un('pointermove', this.plotMouseOverOutHandler, this);
  olPlot.Event.unListen(this.mapViewport, olPlot.Event.EventType.MOUSEMOVE,
    this.controlPointMouseMoveHandler, this);
  olPlot.Event.unListen(this.mapViewport, olPlot.Event.EventType.MOUSEUP,
    this.controlPointMouseUpHandler, this);
  this.map.un('pointerdown', this.plotMouseDownHandler, this);
  this.map.un('pointerup', this.plotMouseUpHandler, this);
  this.map.un('pointerdrag', this.plotMouseMoveHandler, this);
};

olPlot.PlotEdit.prototype.deactivate = function () {
  this.activePlot = null;
  this.mouseOver = false;
  this.destroyHelperDom();
  this.disconnectEventHandlers();
  this.elementTable = {};
  this.activeControlPointId = null;
  this.startPoint = null;
};

olPlot.PlotEdit.prototype.disableMapDragPan = function () {
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

olPlot.PlotEdit.prototype.enableMapDragPan = function () {
  if (this.mapDragPan != null) {
    this.mapDragPan.setActive(true);
    this.mapDragPan = null;
  }
};