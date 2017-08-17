
P.PlotDraw = function(map){
    goog.base(this, []);
    this.points = null;
    this.plot = null;
    this.feature = null;
    this.plotType = null;
    this.plotParams = null;
    this.mapViewport = null;
    this.dblClickZoomInteraction = null;
    var stroke = new ol.style.Stroke({color: '#7DC826', width: 1.25});
    var fill = new ol.style.Fill({color: 'rgba(158, 255, 232, 0.8)'});
    var icon = new ol.style.Icon({
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      opacity: 0.75,
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADQ0lEQVRYR8VXTVIaURD+evABi0BYWhVJdJEEVsETBE8gngA4QfAEkhMIJ9CcQDyB4wkkK0w2EjFVWSJkAfPgderNODplzb+LvO3MdH+vv6/76yH850MvyT/axHZ+genOFNO0cRIBuCmhtCyKJoAWQLVnScfEbJJC/8NvOYwLKBYAO3FBHIGoYwdm/g6GyQbZNyfFJRDqIPr08NxkKdvVPxhHAYkE8KOcaTAZJwCVmPkSUrZ04NHWRp0MJ2FG8fD93epSUwIhTonoM8BTYtX+OFkPwkCEAhiVRYuITpxLczs/lwOrII6ZqOUXlJhPs3N5uCiIhvsd8fogDEQggJ9vRE1l6MpNnlEYqgwudCXCy8pTY429tYGaA4KnuZncCRJqIIBRWZh2KRX3eSV7lBVX0cldaDxlS+5CiC4RNZn5W3Ui/avmdxuH98wZwPe5mdxeFMTA4TXBYTZzc3mwLIoxQK/Zsnb8ROlbgest0YNBXzTyjELPpSJBevtVY827awMdXQWADyu3svc8hi8At/xaQIoyNQKOkia3tQN8BfNYa0F3UHUi64kAsFJ7REYHhP00AMA4Z1Y9MoyL1ABApIWUjP8HtPbcYO6mAaCHSdOuAKih9ZCqArqDwIPEAK7fig5Ax1o4zJi6QyUpCD28iFCyYynuV+6kM8o9x1+Em9imbPYG4GFuJvfcVkoGwGnhZUGY2iN0R/iZVNggeqQBhlFP2gl2ByhlhpXfNrKgWzlmY1y4VVgURM/p5+ij50d+LjvLotCju6a1VL1bmb7+ERZuVLadrQnGIDe32stXohspSMX93F/ZdZPrVqxMrEZQnlA3fFhA7FGqK8GWPLDLtiH0bPD6v7MfrJxJR1lx5iwsjg7CNqaY+4D2Bedoy2WoQWWyPvfeSvsHYOx7rTrKikM14A3+SEU0/U9vRJT+8UJxYmoqFsXskIB3cd5n4Fd+ZtXiLKuRFLgJvQtKFIgw1ccaREEJniZkMATd/9VbqxsFMhEF3mDX5ewgyB2DHC8MTGwK3CBBekjCuxdQYgD6Y0cPMJ35oA/fG2vUk/yQpKbA/fD5yl6dyNO4vL+4Am4AvTvqv6MkontRF6S5YdQ3qTQQFTTJ83/+27ww2VdnUwAAAABJRU5ErkJggg=='
    })
    this.style = new ol.style.Style({fill:fill, stroke:stroke, image: icon});
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