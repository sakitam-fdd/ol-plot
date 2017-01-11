/**
 * @Description: 用于周边搜索circle
 * @author FDD
 * @date 2017/1/11
 * @version V1.0.0
 */

P.Custom.CustomCircle = function (center, params) {
  // goog.base(this, []);
  /**
   * 当前配置
   * @type {*}
   */
  this.options = params || {};

  if (!params['map']) {
    throw new goog.debug.Error
  }
  /**
   * 默认配置
   * @type {{radius: number, minRadius: number, maxRadius: number, layerName: string}}
   */
  this.defaultConfig = {
    radius: 500,
    minRadius: 50,
    maxRadius: 50000,
    layerName: 'perimeterSerachLayer'
  };
  this.options = $.extend(this.defaultConfig, this.options);
  /**
   * 当前半径
   */
  this.currentMeterRadius = this.options.radius;
  /**
   * 线要素
   * @type {ol.Feature}
   */
  this.lineStringFeat = new ol.Feature({});
  /**
   * 中心点要素
   * @type {ol.Feature}
   */
  this.centerFeat = new ol.Feature({});
  /**
   * 面要素
   * @type {ol.Feature}
   */
  this.polygonFeat = new ol.Feature({});
  /**
   * 如果当前坐标不是米制单位需要计算获取长度
   * @type {ol.Sphere}
   */
  this.sphare = new ol.Sphere(6378137);
  /**
   * 获取当前地图
   */
  this.map = this.options.map;
  /**
   * 编辑按钮id
   * @type {string}
   */
  this.eidtId = "HandleLabel" + Math.floor((Math.random() + Math.random()) * 1000);
  this.ismousedown = false;
  this.circle = null;
  this.isMoving = false;
  this.circleObject = null;
  this.projection = this.getCurrentProjection()
  this.projectRadius = null;
  this.markerOverlay = null;
  /**
   * 最小半径
   * @type {number}
   */
  this.minProjectRadius = this.transformRadius(this.options.center, this.options.minRadius);
  /**
   * 最大半径
   * @type {number}
   */
  this.maxProjectRadius = this.transformRadius(this.options.center, this.options.maxRadius);

  this.addCircle(this.options.center, this.options.radius);
};

goog.inherits(P.Custom.CustomCircle, ol.geom.Polygon);
// goog.mixin(P.Custom.CustomCircle.prototype, P.Custom.prototype);

/**
 * 创建circle
 * @param center
 * @param radius
 */
P.Custom.CustomCircle.prototype.addCircle = function (center, radius) {
  var layer = this.getVectorLayer(this.options.layerName);
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
  this.projectRadius = this.transformRadius(center, radius);
  this.circle = new ol.geom.Circle(center, this.projectRadius);

  var polygon = ol.geom.Polygon.fromCircle(this.circle);
  this.polygonFeat.setGeometry(polygon);
  layer.getSource().addFeature(this.polygonFeat);
  if(this.options.style && this.options.style instanceof ol.style.Style){
    this.polygonFeat.setStyle(this.options.style);
  }

  var coordinates = polygon.getCoordinates();
  var multiLineString = new ol.geom.MultiLineString(coordinates);
  this.lineStringFeat.setGeometry(multiLineString);
  layer.getSource().addFeature(this.lineStringFeat);
  this.lineStringFeat.setStyle(style);

  this.addCircleFeat(layer); //添加中心点
  this.addMaker(); // 添加maker
  this.editCircle(); // 添加编辑
  this.getThis()
};
/**
 * 获取图层
 * @returns {*}
 */
P.Custom.CustomCircle.prototype.getVectorLayer = function (layerName) {
  var vector = null;
  if (this.map) {
    var layers = this.map.getLayers();
    layers.forEach(function (layer) {
      var layernameTemp = layer.get("layerName");
      if (layernameTemp === layerName) {
        vector = layer;
      }
    }, this);
  }
  if (!vector) {
    vector = new ol.layer.Vector({
      layerName: layerName,
      source: new ol.source.Vector({
        wrapX: false,
      }),
      style: new ol.style.Style({
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
      })
    });
    this.map.addLayer(vector);
  }
  this.targetLayer = vector;
  return vector;
};
/**
 * 获取当前投影坐标
 */
P.Custom.CustomCircle.prototype.getCurrentProjection = function () {
  return this.map.getView().getProjection();
  //"EPSG:102100" （米制）
  //"EPSG:4326","EPSG:4490" (经纬度)
  //ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
}
/**
 * 添加中心点要素
 */
P.Custom.CustomCircle.prototype.addCircleFeat = function (layer) {
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
  this.centerFeat.setGeometry(new ol.geom.Point(this.circle.getCenter()));
  this.centerFeat.setStyle(centerStyle);
  layer.getSource().addFeature(this.centerFeat);
};
/**
 * 添加编辑按钮
 */
P.Custom.CustomCircle.prototype.addMaker = function () {
  var vienna = "<div style='display: none; text-decoration: none;color: white;font-size: 14px;font-weight: bold;margin: 0px; padding: 0px; width: 31px; height: 19px; overflow: hidden;'>" +
    "<img src='data:img;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAUCAYAAABGUvnzAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBXaW5kb3dzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjA2MDQwMkMzRDNGRTExRTJBQTNGRTNFMDhCOTA5NDczIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjA2MDQwMkM0RDNGRTExRTJBQTNGRTNFMDhCOTA5NDczIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MDYwNDAyQzFEM0ZFMTFFMkFBM0ZFM0UwOEI5MDk0NzMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MDYwNDAyQzJEM0ZFMTFFMkFBM0ZFM0UwOEI5MDk0NzMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5OfKcHAAAFT0lEQVRo3uWaS2wbRRjHTQOoRFTi0ZagVhQJiRO9AOoNCXEhnIpUwQXK49QTHJKmVbAbqkXiglTa3qmEVJWgIoJ4qChKiYBIDsRJlNj1I97Eid/xer2OHTtOYmf4f2Z3tbYn8dq1lMqO9FOkzOzM7P//zcw3O7EIgmDh8BB4WBgcPCqcP39a6O//AnwNhk3R1/cdfl8Dn4O3weFd+jFyEPRYLBZHu7Df2jLGLLzOHxFstmPo3IbG7D8PDy86Z2akBbc7lYjFcmZZ9PkUeu73kZEA2vkXfIbBPLWHwT2gl4RhbfDDMZir7bzDIblmZ1MBUcwtmYDqeebnlTk8V0/baoNpAI8JVuurqPzLX6OjocLGRnGnVGIlolhsHDynPr9jHx+PYCC/oe0XdzH4efBRmxpco+1qPF4Mrqww0e9nPq+Xedxu5jYB1aP69NzK8jKTJGlXbY0G0wC6haGhl1FpdGpiIkYGbW9ttYwi2kO0JjCQMfTxbAcZXKNtJBxmXo+HuZzO+4YMD4VCbG5qqkZbo8GPgheEgYFvJ8bGwtvb22yzUGg5ZDS9IAZyo4MMrtA2GonoM7ZVUHsUNNXaagYfAEexN3x44/p1N5mLpZlt5PNcXvvEUabRsjJol0z+8eZNEZH2egcYXKGtLMtMFEXm8/m4aPo1Wkb4sWQnEokKbTWDKXt9Sbhw4ZuZyck4mZBbX+eidUI0U06Q0aLHoyDSrnSAwbq203Z7nGbZIgzmYdSumXIiFAyyBZdL11Yz+EnwBjK7u4l4fGM9k2HZtbUajB3wys3Wo/ZhdAmD+LsDDNa1jYbDG2TAciBQg1EzXrnZepS0pWRZ11YzmDblM5jW9mwmU1xLp1laUSowNlxdxqNefVolvrLZZtHnoTY3WNcWwhfDmMGUEBkxalVdxqNe/TVMIk1bzeDnwHtw/Z9cNltSsE+kkskKjI1Wl/GoVz+fy7GrgjCHyD7S5gbr2mLilGKxGItGoxUYtaou41GvfgYrpKat0eD38Yc/pXi8kJIkllxdrcHYMK/cbD0ZiQCW6R289KSahLS7wWVtsf0VkghuSoSqMWrGKzdbD2ditp7N6tpqBh8D7yARGPHMz8syBrGKSONh7KCZciKJgUSCwRyWkO/VM2I7G6xr63U65TS2P8qkeRi1a6acULD9RUMhXVvNYPqW2StYrVd/unVLzGAQcZzVYtgveGidNFpGULvpVIqN37kTRFSf64Akq0Jbyj1ojySjeeh5S4NlBLWbw9Zn1FYzuBu8As6h4A+nwyHJmOqIBJppLYPak7BEL/p8aUTYGF76mQ4wuFLb6WmJTMYy2nLo+Lm0sFChrWZwFzgOTguXLn1JCQGZQGaEYUxoefm+CSN9xx70/9Lc1zeFJetM+Ual/Q2u0Tbg96c3NzdZHoa0ikKhwOLRaI22xk+VFGknwVm4f40GQrcclPHS0koGBXHOWllaMg/qk7k4/zFaEfxut1IewMWLn6KfQ1X7bzt/qqzRlm7Z6Nv81tZWGTK8GehZ+vIoer1cbY0GUzb7hLqcnC1HG5YU+uzlRuIFg/N0fqUjlFmoPoKjsHDvnvLr7dtLWDruCoODH6P9p9XI7pRv0btq63O5ZCSd+ZJ2Y9cASipVIGP30rb6urBLHcjJ8pJC+4bVeoUyQBoQIsTRMP3948LAwA/ofEi4fPnUHuZWGNyGF/77oi3vwv+AuqQcVyPuzXKaT5EH8RvgA/AueAucUs+Dj1ede7kX/g3286DSq77PvmrLM9gYcd1qmk9nuRPqDDPLCfW5I2rnXWb/ZafBfh5UetT32VdtyeD/AFqSV3weDOF9AAAAAElFTkSuQmCC'" +
    "style='left: 0px; top: 0px;'> <label unselectable='on' id=" + "'" + this.eidtId + "'" +
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
  markerOverlay = jQuery.parseHTML(markerOverlay)[0];
  vienna = jQuery.parseHTML(vienna)[0];
  $(this.map.getTargetElement()).append(vienna);
  $(this.map.getTargetElement()).append(markerOverlay);

  var length = this.sphare.haversineDistance(this.circle.getCenter(), this.circle.getLastCoordinate());
  length = Math.floor(length) + 1;
  if (length > this.options.maxRadius) {
    length = this.options.maxRadius;
  }
  $(("#" + this.eidtId)).html(length + "m");

  var markerPos = this.circle.getLastCoordinate();
  this.markerOverlay = new ol.Overlay({
    position: markerPos,
    positioning: 'center-center',
    element: vienna,
    offset: [0, 0]
  });
  this.map.addOverlay(this.markerOverlay);
  $(vienna).css("display", "block");
};
/**
 * 编辑当前circle
 */
P.Custom.CustomCircle.prototype.editCircle = function () {
  var that = this;
  $(document).on('mouseup', function (event) {
    if (that.ismousedown && that.isMoving) {
      if (that.options.onRadiusChangeEnd) {
        that.options.onRadiusChangeEnd(that.circleObject);
      }
    }
    that.ismousedown = false;
    that.isMoving = false;
    $(document).off("mousemove");
    that.markerOverlay.getElement().off('mousemove');
  });


  this.markerOverlay.getElement().on("mouseup", function (event) {
    if (that.ismousedown && that.isMoving) {
      if (that.options.onRadiusChangeEnd) {
        that.options.onRadiusChangeEnd(that.circleObject);
      }
    }
    that.ismousedown = false;
    that.isMoving = false;
    that.markerOverlay.getElement().off('mousemove');
  });

  this.markerOverlay.getElement().on("mousedown", function (event) {
    that.ismousedown = true;
    event.preventDefault();
    that.map.on('pointermove', function (event) {
      that.isMoving = true;
      if (that.ismousedown) {
        if (event.preventDefault) {
          event.preventDefault();
        } else {
          event.returnValue = false;
        }
        // TODO 半径需要转换
        that.currentMeterRadius = that.sphare.haversineDistance(that.circle.getCenter(), that.circle.getLastCoordinate());
        var radius = that.getRadiusSquared(event);
        if (radius >= that.minProjectRadius && radius <= that.maxProjectRadius) {
          // TODO 注意要素坐标和半径之间转换关系
          that.circle.setRadius(radius);
          var polygon = ol.geom.Polygon.fromCircle(that.circle);
          that.polygonFeat.setGeometry(polygon);
          var coordinates = polygon.getCoordinates();
          var multiLineString = new ol.geom.MultiLineString(coordinates);
          that.lineStringFeat.setGeometry(multiLineString);
          that.currentMeterRadius = Math.floor(this.currentMeterRadius) + 1;
          (that.currentMeterRadius > that.maxRadius) ? (that.currentMeterRadius = that.currentMeterRadius) : (that.currentMeterRadius = that.maxRadius)
          $(("#" + that.eidtId)).html(that.currentMeterRadius + "m");
          that.markerOverlay.setPosition(that.circle.getLastCoordinate());
        }
      }
    });
  });
};
/**
 * 获取半径的平方根
 * @param event
 * @returns {number}
 */
P.Custom.CustomCircle.prototype.getRadiusSquared = function (event) {
  var center = this.circle.getCenter();
  var lastCoordinat = event.coordinate;
  var radius = Math.sqrt(Math.pow(lastCoordinat[0] - center[0], 2) + Math.pow(lastCoordinat[1] - center[1], 2));
  if (radius - this.maxProjectRadius > 0.0) {
    radius = this.maxProjectRadius;
  } else if (radius - this.minProjectRadius < 0) {
    radius = this.minProjectRadius;
  }
  return radius;
};
/**
 * 转换半径
 * @param center
 * @param meterRadius
 * @returns {number}
 */
P.Custom.CustomCircle.prototype.transformRadius = function (center, meterRadius) {
  var lastcoord = this.sphare.offset(center, meterRadius, (270 / 360) * 2 * Math.PI);
  var dx = center[0] - lastcoord[0];
  var dy = center[1] - lastcoord[1];
  return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
};
/**
 * 获取当前创建的circle
 */
P.Custom.CustomCircle.prototype.getThis = function () {
  var that = this;
  this.circleObject = {
    feature: this.lineStringFeat,
    centerFeature: this.centerFeat,
    markerOverLay: this.markerOverlay,
    getRadius: function () {
      return that.currentMeterRadius;
    },
    setCenter: function (center) {
      var circle = this.getCircle();
      circle.setCenter(center);
      var polygon = ol.geom.Polygon.fromCircle(circle);
      var coordinates = polygon.getCoordinates();
      var multiLineString = new ol.geom.MultiLineString(coordinates);
      that.lineStringFeat.setGeometry(multiLineString);
      that.centerFeat.setGeometry(new ol.geom.Point(center));
      that.markerOverlay.setPosition(that.lineStringFeat.getGeometry().getLastCoordinate());
    },
    getCircle: function () {
      return that.circle;
    },
    setRadius: function (radius) {
      var circle = this.getCircle();
      // TODO 注意转换关系
      var projRadius = that.transformRadius(circle.getCenter(), radius);
      that.currentMeterRadius = radius;
      if (projRadius >= that.minProjectRadius && projRadius <= that.maxProjectRadius) {
        circle.setRadius(projRadius);
        var polygon = ol.geom.Polygon.fromCircle(circle);
        var coordinates = polygon.getCoordinates();
        var multiLineString = new ol.geom.MultiLineString(coordinates);
        that.lineStringFeat.setGeometry(multiLineString);
        that.currentMeterRadius = Math.floor(that.currentMeterRadius);
        if (that.currentMeterRadius > that.maxRadius) {
          that.currentMeterRadius = that.maxRadius;
        }
        $(("#" + that.eidtId)).html(that.currentMeterRadius + "m");
        that.markerOverlay.setPosition(circle.getLastCoordinate());
      }
      if (that.options.onRadiusChangeEnd) {
        that.options.onRadiusChangeEnd(that.circleObject);
      }
    },
    getExtent: function () {
      return this.getCircle().getExtent();
    },
    getWKT: function () {
      var polygon = ol.geom.Polygon.fromCircle(that.getCircle());
      var wkt = new ol.format.WKT().writeGeometry(polygon);
      return wkt;
    },
    destroy: function () {
      that.map.removeLayer(that.targetLayer);
      that.map.removeOverlay(that.markerOverlay);
    }
  };
  return this.circleObject;
};