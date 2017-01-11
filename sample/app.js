var map, plotDraw, plotEdit, drawOverlay, drawStyle;

function init() {
    //创建全局对象
    window.ObservableObj = new ol.Object();
    // 初始化地图，底图使用openstreetmap在线地图
    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
        /*        source: new ol.source.MapQuest({layer: 'sat'})*/
                source: new ol.source.Stamen({
                    layer: 'watercolor'
                })
            })
        ],
        view  : new ol.View({
            center: ol.proj.transform([37.41, 8.82], 'EPSG:4326', 'EPSG:3857'),
            zoom  : 4
        })
    });

    map.on('click', function (e) {
        if (plotDraw.isDrawing()) {
            return;
        }
        var feature = map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
            return feature;
        });
        if (feature) {
            // 开始编辑
            plotEdit.activate(feature);
        } else {
            // 结束编辑
            plotEdit.deactivate();
        }
    });

    // 初始化标绘绘制工具，添加绘制结束事件响应
    plotDraw = new P.PlotDraw(map);
    plotDraw.on(P.Event.PlotDrawEvent.DRAW_END, onDrawEnd, false, this);

    // 初始化标绘编辑工具
    plotEdit = new P.PlotEdit(map);

    // 设置标绘符号显示的默认样式
    var stroke = new ol.style.Stroke({color: '#FF0000', width: 2});
    var fill   = new ol.style.Fill({color: 'rgba(0,255,0,0.4)'});
    drawStyle  = new ol.style.Style({fill: fill, stroke: stroke});

    // 绘制好的标绘符号，添加到FeatureOverlay显示。
    drawOverlay = new ol.layer.Vector({
        source: new ol.source.Vector()
    });
    drawOverlay.setStyle(drawStyle);
    drawOverlay.setMap(map);
    initEvent();
}

// 绘制结束后，添加到FeatureOverlay显示。
function onDrawEnd(event) {
    var feature = event.feature;
    // 开始编辑
    plotEdit.activate(feature);
    drawOverlay.getSource().addFeature(feature);
}

// 指定标绘类型，开始绘制。
function activate(type) {
    plotEdit.deactivate();
    plotDraw.activate(type);
}

function showAbout() {
    document.getElementById("aboutContainer").style.visibility = "visible";
}

function hideAbout() {
    document.getElementById("aboutContainer").style.visibility = "hidden";
}
window.testHX = function () {
    var mm = new P.Plot.Circle([[1359967.607249856, 1066449.4186347784], [1634825.754621606, 1066449.4186347784]]);
    mm.generate();
    drawOverlay.getSource().addFeature(new ol.Feature({
        geometry: mm
    }));
    // 开始编辑
    //plotEdit.activate(mm);
};


window.testCircle = function () {
    var mm = P.Plot.Circle.createCircleByCenterRadius([1359967.607249856, 1066449.4186347784], 500,map);
};

function creatCircle () {
  var style = new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(65,105,225, 0.5)'
    })
  });
  var projection = ol.proj.get("EPSG:3857");
  var radius = ol.proj.fromLonLat([5000, 0], projection)[0]
  var zuobiao = ol.proj.transform([5000, 0], 'EPSG:102100', 'EPSG:4326')
  var config = {
    radius: radius,
    maxRadius: 500000,
    map: map,
    layerName: 'layerName',
    style: style,
    center: [1359967.607249856, 1066449.4186347784]
  };
  P.Custom.CustomCircle([1359967.607249856, 1066449.4186347784],config)
}