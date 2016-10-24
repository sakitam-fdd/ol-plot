P.Plot.Circle = function (points, params) {
    goog.base(this, []);
    this.type = P.PlotTypes.CIRCLE;
    this.fixPointCount = 2;
    this.setPoints(points);
    this.set("params", params);
};

goog.inherits(P.Plot.Circle, ol.geom.Polygon);
goog.mixin(P.Plot.Circle.prototype, P.Plot.prototype);

P.Plot.Circle.prototype.generate = function () {
    var center = this.points[0];
    var radius = P.PlotUtils.distance(center, this.points[1]);
    this.setCoordinates([this.generatePoints(center, radius)]);
};

P.Plot.Circle.prototype.generatePoints = function (center, radius) {
    var x, y, angle, points = [];
    for (var i = 0; i <= P.Constants.FITTING_COUNT; i++) {
        angle = Math.PI * 2 * i / P.Constants.FITTING_COUNT;
        x = center[0] + radius * Math.cos(angle);
        y = center[1] + radius * Math.sin(angle);
        points.push([x, y]);
    }
    return points;
};

/*根据圆心和半径创建圆*/
P.Plot.Circle.createCircleByCenterRadius = function (obj) {
    var defaultConfig = {
        radius: 500,
        minRadius: 50,
        maxRadius: 50000,
        layerName: "perimeterSerachLayer"
    };
    obj = $.extend(defaultConfig, obj);
    var currentMeterRadius = obj.radius;
    var lineStringFea = new ol.Feature({});
    var centerFea = new ol.Feature({});
    var sphare = new ol.Sphere(6378137);
    var circle, isMoving;
    var eidtId = "nbHandleLabel" + Math.floor((Math.random() + Math.random()) * 1000);
    var ismousedown = false;
    obj.minProjectRadius = transformRadius(obj.center, obj.minRadius);
    obj.maxProjectRadius = transformRadius(obj.center, obj.maxRadius);
    var vienna = "<div style='display: none; text-decoration: none;color: white;font-size: 14px;font-weight: bold;margin: 0px; padding: 0px; width: 31px; height: 19px; overflow: hidden;'>" +
        "<img src='data:img;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAUCAYAAABGUvnzAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjA2MDQwMkMzRDNGRTExRTJBQTNGRTNFMDhCOTA5NDczIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjA2MDQwMkM0RDNGRTExRTJBQTNGRTNFMDhCOTA5NDczIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDYwNDAyQzFEM0ZFMTFFMkFBM0ZFM0UwOEI5MDk0NzMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDYwNDAyQzJEM0ZFMTFFMkFBM0ZFM0UwOEI5MDk0NzMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5OfKcHAAAFT0lEQVRo3uWaS2wbRRjHTQOoRFTi0ZagVhQJiRO9AOoNCXEhnIpUwQXK49QTHJKmVbAbqkXiglTa3qmEVJWgIoJ4qChKiYBIDsRJlNj1I97Eid/xer2OHTtOYmf4f2Z3tbYn8dq1lMqO9FOkzOzM7P//zcw3O7EIgmDh8BB4WBgcPCqcP39a6O//AnwNhk3R1/cdfl8Dn4O3weFd+jFyEPRYLBZHu7Df2jLGLLzOHxFstmPo3IbG7D8PDy86Z2akBbc7lYjFcmZZ9PkUeu73kZEA2vkXfIbBPLWHwT2gl4RhbfDDMZir7bzDIblmZ1MBUcwtmYDqeebnlTk8V0/baoNpAI8JVuurqPzLX6OjocLGRnGnVGIlolhsHDynPr9jHx+PYCC/oe0XdzH4efBRmxpco+1qPF4Mrqww0e9nPq+Xedxu5jYB1aP69NzK8jKTJGlXbY0G0wC6haGhl1FpdGpiIkYGbW9ttYwi2kO0JjCQMfTxbAcZXKNtJBxmXo+HuZzO+4YMD4VCbG5qqkZbo8GPgheEgYFvJ8bGwtvb22yzUGg5ZDS9IAZyo4MMrtA2GonoM7ZVUHsUNNXaagYfAEexN3x44/p1N5mLpZlt5PNcXvvEUabRsjJol0z+8eZNEZH2egcYXKGtLMtMFEXm8/m4aPo1Wkb4sWQnEokKbTWDKXt9Sbhw4ZuZyck4mZBbX+eidUI0U06Q0aLHoyDSrnSAwbq203Z7nGbZIgzmYdSumXIiFAyyBZdL11Yz+EnwBjK7u4l4fGM9k2HZtbUajB3wys3Wo/ZhdAmD+LsDDNa1jYbDG2TAciBQg1EzXrnZepS0pWRZ11YzmDblM5jW9mwmU1xLp1laUSowNlxdxqNefVolvrLZZtHnoTY3WNcWwhfDmMGUEBkxalVdxqNe/TVMIk1bzeDnwHtw/Z9cNltSsE+kkskKjI1Wl/GoVz+fy7GrgjCHyD7S5gbr2mLilGKxGItGoxUYtaou41GvfgYrpKat0eD38Yc/pXi8kJIkllxdrcHYMK/cbD0ZiQCW6R289KSahLS7wWVtsf0VkghuSoSqMWrGKzdbD2ditp7N6tpqBh8D7yARGPHMz8syBrGKSONh7KCZciKJgUSCwRyWkO/VM2I7G6xr63U65TS2P8qkeRi1a6acULD9RUMhXVvNYPqW2StYrVd/unVLzGAQcZzVYtgveGidNFpGULvpVIqN37kTRFSf64Akq0Jbyj1ojySjeeh5S4NlBLWbw9Zn1FYzuBu8As6h4A+nwyHJmOqIBJppLYPak7BEL/p8aUTYGF76mQ4wuFLb6WmJTMYy2nLo+Lm0sFChrWZwFzgOTguXLn1JCQGZQGaEYUxoefm+CSN9xx70/9Lc1zeFJetM+Ual/Q2u0Tbg96c3NzdZHoa0ikKhwOLRaI22xk+VFGknwVm4f40GQrcclPHS0koGBXHOWllaMg/qk7k4/zFaEfxut1IewMWLn6KfQ1X7bzt/qqzRlm7Z6Nv81tZWGTK8GehZ+vIoer1cbY0GUzb7hLqcnC1HG5YU+uzlRuIFg/N0fqUjlFmoPoKjsHDvnvLr7dtLWDruCoODH6P9p9XI7pRv0btq63O5ZCSd+ZJ2Y9cASipVIGP30rb6urBLHcjJ8pJC+4bVeoUyQBoQIsTRMP3948LAwA/ofEi4fPnUHuZWGNyGF/77oi3vwv+AuqQcVyPuzXKaT5EH8RvgA/AueAucUs+Dj1ede7kX/g3286DSq77PvmrLM9gYcd1qmk9nuRPqDDPLCfW5I2rnXWb/ZafBfh5UetT32VdtyeD/AFqSV3weDOF9AAAAAElFTkSuQmCC'" +
        "style='left: 0px; top: 0px;'> <label unselectable='on' id=" + "'" + eidtId + "'" +
        "style='position: absolute; display: inline; cursor: inherit; border: none; padding: 0px;" +
        "white-space: nowrap; font-style: normal;" +
        "font-variant: normal; font-weight: normal;" +
        "font-stretch: normal; font-size: 12px;" +
        "line-height: 20px;font-family: arial, simsun; height: 20px;" +
        "color: black; text-indent: 5px;text-align: center; zoom: 1;" +
        "width: 56px; -webkit-user-select: none;left: 30px; top: 0px;" +
        "background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAUCAYAAABGUvnzAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjA2MDQwMkMzRDNGRTExRTJBQTNGRTNFMDhCOTA5NDczIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjA2MDQwMkM0RDNGRTExRTJBQTNGRTNFMDhCOTA5NDczIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDYwNDAyQzFEM0ZFMTFFMkFBM0ZFM0UwOEI5MDk0NzMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDYwNDAyQzJEM0ZFMTFFMkFBM0ZFM0UwOEI5MDk0NzMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5OfKcHAAAFT0lEQVRo3uWaS2wbRRjHTQOoRFTi0ZagVhQJiRO9AOoNCXEhnIpUwQXK49QTHJKmVbAbqkXiglTa3qmEVJWgIoJ4qChKiYBIDsRJlNj1I97Eid/xer2OHTtOYmf4f2Z3tbYn8dq1lMqO9FOkzOzM7P//zcw3O7EIgmDh8BB4WBgcPCqcP39a6O//AnwNhk3R1/cdfl8Dn4O3weFd+jFyEPRYLBZHu7Df2jLGLLzOHxFstmPo3IbG7D8PDy86Z2akBbc7lYjFcmZZ9PkUeu73kZEA2vkXfIbBPLWHwT2gl4RhbfDDMZir7bzDIblmZ1MBUcwtmYDqeebnlTk8V0/baoNpAI8JVuurqPzLX6OjocLGRnGnVGIlolhsHDynPr9jHx+PYCC/oe0XdzH4efBRmxpco+1qPF4Mrqww0e9nPq+Xedxu5jYB1aP69NzK8jKTJGlXbY0G0wC6haGhl1FpdGpiIkYGbW9ttYwi2kO0JjCQMfTxbAcZXKNtJBxmXo+HuZzO+4YMD4VCbG5qqkZbo8GPgheEgYFvJ8bGwtvb22yzUGg5ZDS9IAZyo4MMrtA2GonoM7ZVUHsUNNXaagYfAEexN3x44/p1N5mLpZlt5PNcXvvEUabRsjJol0z+8eZNEZH2egcYXKGtLMtMFEXm8/m4aPo1Wkb4sWQnEokKbTWDKXt9Sbhw4ZuZyck4mZBbX+eidUI0U06Q0aLHoyDSrnSAwbq203Z7nGbZIgzmYdSumXIiFAyyBZdL11Yz+EnwBjK7u4l4fGM9k2HZtbUajB3wys3Wo/ZhdAmD+LsDDNa1jYbDG2TAciBQg1EzXrnZepS0pWRZ11YzmDblM5jW9mwmU1xLp1laUSowNlxdxqNefVolvrLZZtHnoTY3WNcWwhfDmMGUEBkxalVdxqNe/TVMIk1bzeDnwHtw/Z9cNltSsE+kkskKjI1Wl/GoVz+fy7GrgjCHyD7S5gbr2mLilGKxGItGoxUYtaou41GvfgYrpKat0eD38Yc/pXi8kJIkllxdrcHYMK/cbD0ZiQCW6R289KSahLS7wWVtsf0VkghuSoSqMWrGKzdbD2ditp7N6tpqBh8D7yARGPHMz8syBrGKSONh7KCZciKJgUSCwRyWkO/VM2I7G6xr63U65TS2P8qkeRi1a6acULD9RUMhXVvNYPqW2StYrVd/unVLzGAQcZzVYtgveGidNFpGULvpVIqN37kTRFSf64Akq0Jbyj1ojySjeeh5S4NlBLWbw9Zn1FYzuBu8As6h4A+nwyHJmOqIBJppLYPak7BEL/p8aUTYGF76mQ4wuFLb6WmJTMYy2nLo+Lm0sFChrWZwFzgOTguXLn1JCQGZQGaEYUxoefm+CSN9xx70/9Lc1zeFJetM+Ual/Q2u0Tbg96c3NzdZHoa0ikKhwOLRaI22xk+VFGknwVm4f40GQrcclPHS0koGBXHOWllaMg/qk7k4/zFaEfxut1IewMWLn6KfQ1X7bzt/qqzRlm7Z6Nv81tZWGTK8GehZ+vIoer1cbY0GUzb7hLqcnC1HG5YU+uzlRuIFg/N0fqUjlFmoPoKjsHDvnvLr7dtLWDruCoODH6P9p9XI7pRv0btq63O5ZCSd+ZJ2Y9cASipVIGP30rb6urBLHcjJ8pJC+4bVeoUyQBoQIsTRMP3948LAwA/ofEi4fPnUHuZWGNyGF/77oi3vwv+AuqQcVyPuzXKaT5EH8RvgA/AueAucUs+Dj1ede7kX/g3286DSq77PvmrLM9gYcd1qmk9nuRPqDDPLCfW5I2rnXWb/ZafBfh5UetT32VdtyeD/AFqSV3weDOF9AAAAAElFTkSuQmCC) -31px 0px;'></label>" +
        "</div>";

    var markerOverlay = "<div title='Marker'></div>";
    var vectorLayer;
    markerOverlay = jQuery.parseHTML(markerOverlay)[0];
    vienna = jQuery.parseHTML(vienna)[0];
    var style = ol.style.Style({
        fill: new ol.style.Fill({
            color: 'red'
        }),
        stroke: new ol.style.Stroke({
            color: 'blue',
            width: 1233
        }),
        image: new ol.style.Circle({
            radius: 117,
            fill: new ol.style.Fill({
                color: 'blue'
            })
        })
    });

    var b = false;
    var layers = obj.map.getLayers();
    var targetLayer = null;
    layers.forEach(function (layer) {
        if (layer.get("layerName") === obj.layerName) {
            b = true;
            targetLayer = layer;
        }
    });
    if (!b) {
        var source = new ol.source.Vector({wrapX: false});
        vectorLayer = new ol.layer.Vector({
            source: source,
            layerName: obj.layerName
        });
        obj.map.addLayer(vectorLayer);
        targetLayer = vectorLayer;
    }


    $(obj.map.getTargetElement()).append(vienna);
    $(obj.map.getTargetElement()).append(markerOverlay);
    addCircle(obj.center, obj.radius);

    function addCircle(center, radius) {
        obj.projectRadius = transformRadius(center, radius);
        circle = new ol.geom.Circle(center, obj.projectRadius);
        var polygon = ol.geom.Polygon.fromCircle(circle);
        var coordinates = polygon.getCoordinates();
        var multiLineString = new ol.geom.MultiLineString(coordinates);
        lineStringFea.setGeometry(multiLineString);
        targetLayer.getSource().addFeature(lineStringFea);
        lineStringFea.setStyle(style);
        var centerStyle = ol.style.Style({
            fill: new ol.style.Fill({
                color: 'red'
            }),
            stroke: new ol.style.Stroke({
                color: 'blue',
                width: 2
            }),
            image: new ol.style.Icon({
                src: "data:image;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkU2MTZEMEY5RjU3MjExRTVBODhFQTRFRkJDRUQzQzRGIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkU2MTZEMEZBRjU3MjExRTVBODhFQTRFRkJDRUQzQzRGIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RTYxNkQwRjdGNTcyMTFFNUE4OEVBNEVGQkNFRDNDNEYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RTYxNkQwRjhGNTcyMTFFNUE4OEVBNEVGQkNFRDNDNEYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz56huJRAAAByElEQVR42uxYwUrDQBBNYqENirZGFLxV8Ee8e/HkP/g5/o8XP6NQb4JiTA2FGDSNMzLBJWRnd7NbacsODKQ77e7bmTcvuw3rug422aJgw80D9AA9wG0HOFB+Iwy56B54DD6kuZoNV+QleEHP3abQ4VAp1N0AEdghgdMxBJl3Al0DwBH4BCOG1cKFFgR2bQD3wY8saYWZXOoCNGmS2AG4wJAa2gCRc2OHzTmmOR108d+uZZzD8YQWHdHYJ/EtJe51/QbnzJQiosFB3OkZs8EpUzJsiCfwb0n8BThY2ZY4ZjI3VfAJYxdM9mMXHBxKxpPWAig9N+DX9CzKUmI4txEHBwzRxed7Acgt+B3xsIm/9Vk/suh0MXtXrSwd05iqlJErmbG13hcfHYArpkMbewB/Fz5nNBYIsmMyt5HMJBIyn4Cft5oEy/oF/tjSuGcJB0uQmdQW4AGJapfMXAriLDPM3kxS5hwALm1LXDC8mjPxBtyc4WDhosRN+WLFq24iUKGkEqcKcJmr4xa+7k57nAG5rn79PcA6Om5Vgui6sAV7Deipg1iSDwfgch3u7eyRfysuTTrXzhWdAf/h2un/WfAAPUAPcLcB/ggwAItEk7WlWi40AAAAAElFTkSuQmCC"
            })
        });
        centerFea.setGeometry(new ol.geom.Point(circle.getCenter()));
        centerFea.setStyle(centerStyle);
        targetLayer.getSource().addFeature(centerFea);

        var length = sphare.haversineDistance(circle.getCenter(), circle.getLastCoordinate());
        length = Math.floor(length) + 1;
        if (length > obj.maxRadius) {
            length = obj.maxRadius;
        }
        $(("#" + eidtId)).html(length + "m");

        var markerPos = circle.getLastCoordinate();
        markerOverlay = new ol.Overlay({
            position: markerPos,
            positioning: 'center-center',
            element: vienna,
            offset: [0, 0]
        });
        obj.map.addOverlay(markerOverlay);
        $(vienna).css("display", "block");
        editCircle();
    }

    function editCircle() {
        $(document).on('mouseup', function (event) {
            if (ismousedown && isMoving) {
                if (obj.onRadiusChangeEnd) {
                    obj.onRadiusChangeEnd(circle);
                }
            }
            ismousedown = false;
            isMoving = false;
            $(document).off("mousemove");
            $(vienna).off('mousemove');
        });


        $(vienna).on("mouseup", function (event) {
            if (ismousedown && isMoving) {
                if (obj.onRadiusChangeEnd) {
                    obj.onRadiusChangeEnd(circle);
                }
            }
            ismousedown = false;
            isMoving = false;
            $(vienna).off('mousemove');
        });

        $(vienna).on("mousedown", function (event) {
            ismousedown = true;
            event.preventDefault();
            obj.map.on('pointermove', function (mapmoveevt) {
                isMoving = true;
                if (ismousedown) {
                    if (mapmoveevt.preventDefault) {
                        mapmoveevt.preventDefault();
                    } else {
                        mapmoveevt.returnValue = false;
                    }
                    currentMeterRadius = sphare.haversineDistance(circle.getCenter(), circle.getLastCoordinate());
                    var radius = getRadiusSquared_(mapmoveevt);
                    if (radius >= obj.minProjectRadius && radius <= obj.maxProjectRadius) {
                        circle.setRadius(radius);
                        var polygon = ol.geom.Polygon.fromCircle(circle);
                        var coordinates = polygon.getCoordinates();
                        var multiLineString = new ol.geom.MultiLineString(coordinates);
                        lineStringFea.setGeometry(multiLineString);
                        currentMeterRadius = Math.floor(currentMeterRadius) + 1;
                        if (currentMeterRadius > obj.maxRadius) {
                            currentMeterRadius = obj.maxRadius;
                        }
                        $(("#" + eidtId)).html(currentMeterRadius + "m");
                        markerOverlay.setPosition(circle.getLastCoordinate());
                    }
                }
            });
        });
    }

    function getRadiusSquared_(mapmoveevt) {
        var center = circle.getCenter();
        var lastCoordinat = mapmoveevt.coordinate;
        var radius = Math.sqrt(Math.pow(lastCoordinat[0] - center[0], 2) + Math.pow(lastCoordinat[1] - center[1], 2));
        if (radius - obj.maxProjectRadius > 0.0) {
            radius = obj.maxProjectRadius;
        } else if (radius - obj.minProjectRadius < 0) {
            radius = obj.minProjectRadius;
        }
        return radius;
    }

    function transformRadius(center, meterRadius) {
        var lastcoord = sphare.offset(center, meterRadius, (270 / 360) * 2 * Math.PI);
        var dx = center[0] - lastcoord[0];
        var dy = center[1] - lastcoord[1];
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }

    return {
        feature: lineStringFea,
        centerFeature: centerFea,
        markerOverLay: markerOverlay,
        getRadius: function () {
            return currentMeterRadius;
        },
        setCenter: function (center) {
            var circle = this.getCircle();
            circle.setCenter(center);
            var polygon = ol.geom.Polygon.fromCircle(circle);
            var coordinates = polygon.getCoordinates();
            var multiLineString = new ol.geom.MultiLineString(coordinates);
            lineStringFea.setGeometry(multiLineString);
            centerFea.setGeometry(new ol.geom.Point(center));
            markerOverlay.setPosition(lineStringFea.getGeometry().getLastCoordinate());
        },
        getCircle: function () {
            return circle;
        },
        setRadius: function (radius) {
            var circle = this.getCircle();
            var projRadius = transformRadius(circle.getCenter(), radius);
            currentMeterRadius = radius;
            if (projRadius >= obj.minProjectRadius && projRadius <= obj.maxProjectRadius) {
                circle.setRadius(projRadius);
                var polygon = ol.geom.Polygon.fromCircle(circle);
                var coordinates = polygon.getCoordinates();
                var multiLineString = new ol.geom.MultiLineString(coordinates);
                lineStringFea.setGeometry(multiLineString);
                currentMeterRadius = Math.floor(currentMeterRadius);
                if (currentMeterRadius > obj.maxRadius) {
                    currentMeterRadius = obj.maxRadius;
                }
                $(("#" + eidtId)).html(currentMeterRadius + "m");
                markerOverlay.setPosition(circle.getLastCoordinate());
            }
        },
        getExtent: function () {
            return this.getCircle().getExtent();
        },
        getWKT: function () {
            var polygon = ol.geom.Polygon.fromCircle(this.getCircle());
            var wkt = new ol.format.WKT().writeGeometry(polygon);
            return wkt;
        },
        destroy: function () {
            obj.map.removeLayer(targetLayer);
            obj.map.removeOverlay(markerOverlay);
        }
    };
};

