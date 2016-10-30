/**
 * Created by FDD on 2016/10/30.
 */
function initEvent() {
    //等待map加载完成，正常情况map应该对外暴露加载完成事件
    if (map) {
        //监听地图鼠标移动事件
        window.ObservableObj.on("change:mouseOnFeature", function (event) {
            
        });
        //监听地图鼠标点击事件
        window.ObservableObj.on("clickFeatureEvt", function (event) {

        });
    } else {
        window.setTimeout(function () {
            initEvent();
        }, 1000);
    }
};
//去掉默认的contextmenu事件，否则会和右键事件同时出现。
document.oncontextmenu = function(e){
    e.preventDefault();
};
//
document.querySelector('#map').onmousedown = function (e) {
    if(e.button ==2){
        var pixel = map.getEventPixel(e);
        var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
            return feature;
        });
        window.rightMenuClickPosition = map.getEventCoordinate(e);
        window.ObservableObj.set('rightMenuFeature', feature);
        menuPositon = map.getPixelFromCoordinate(window.rightMenuClickPosition);
        showMenus(menuPositon[1], menuPositon[0]);
    }else if(e.button ==0){
        hideMenus();
    }else if(e.button ==1){

    }
}
function _delete() {
    var feature = window.ObservableObj.get('rightMenuFeature');
    drawOverlay.getSource().removeFeature(feature);
}
/*删除某个要素*/
function removeFeature(featuer) {
    if (featuer instanceof ol.Feature) {
        var tragetLayer = this.getLayerByFeatuer(featuer);
        if (tragetLayer) {
            var source = tragetLayer.getSource();
            if (source && source.removeFeature) {
                source.removeFeature(featuer);
            }
        }
    } else {
        console.error("传入的不是要素");
    }
};
/*根据feature得到该feature所在的图层*/
function getLayerByFeatuer(feature) {
    var tragetLayer = null;
    if (feature instanceof ol.Feature) {
        var bin = false, source = null;
        var layers = map.getLayers().getArray();
        var length = layers.length;
        for (var i = 0; i < length; i++) {
            if (!tragetLayer) {
                var source = layers[i].getSource();
                if (source.getFeatures) {
                    var features = source.getFeatures();
                    var feaLength = features.length;
                    for (var j = 0; j < feaLength; j++) {
                        var fea = features[j];
                        if (fea == feature) {
                            tragetLayer = layers[i];
                            break;
                        }
                    }
                }
            } else {
                break;
            }
        }
    } else {
        console.error("传入的不是要素");
    }
    return tragetLayer;
};
var menus = document.querySelector('.menus');
function showMenus(top, left) {
    menus.onmousedown = function (e) {
        e.preventDefault();
    };
    menus.style.display = 'block';
    menus.style.top = top + 'px';
    menus.style.left = left + 'px';
    var aDoc = [document.getElementById('map').offsetWidth,
        document.getElementById('map').offsetHeight];
    var maxWidth = aDoc[0] - menus.offsetWidth;
    var maxHeight = aDoc[1] - menus.offsetHeight;
    menus.offsetTop > maxHeight && (menus.style.top = maxHeight + 'px');
    menus.offsetLeft > maxWidth && (menus.style.left = maxWidth + 'px');
}

function hideMenus() {
    menus.style.display = 'none';
}