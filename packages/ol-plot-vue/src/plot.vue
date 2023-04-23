<template>
  <div class="ol-plot-vue">
    <header class="panel-header">
      <span :title="state.title">{{state.title}}</span>
      <span class="iconfont icon-zuixiaohua" @click="minFunc()"></span>
      <span class="iconfont icon-guanbi" @click="closeFunc()"></span>
    </header>
    <div class="panel-content">
      <div ref="workspace" class="ol-plot-vue-workspace">
        <div class="ol-plot-vue-workspace-scroll">
          <div class="ol-plot-vue-workspace-scroll-inner">
            <div class="plot-list-wrap">
              <div class="plot-list">
                <ul class="clearfix">
                  <li
                      v-for="(tool, index) in plots"
                      class="ol-plot-vue-header-li"
                      :key="index"
                      :class="selected === tool.alias ? 'ol-plot-vue-selected' : ''"
                      @mouseover="mouseOverHandle(tool)"
                      @mouseout="mouseOutHandle(tool)"
                      @click="changeSelectedItem(tool)">
                    <span
                      :style="{
                        background: `url(${getImage(tool.src + ((tool.mouseover || selected === tool.alias) ? '-hover' : ''))}) no-repeat`,
                      }"
                    />
                    <span>{{tool.name}}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div v-if="selected !== 'TextArea' && selected !== 'Point' && selected !== ''">
              <div class="plot-edit">
                <div class="plot-edit-color">
                  <span class="stration span-background">背景色</span>
                  <color-picker v-model="state.backgroundColor"></color-picker>
                  <span class="stration span-border">边框色</span>
                  <color-picker v-model="state.borderColor"></color-picker>
                </div>
                <div class="plot-edit-title">边框线宽</div>
                <div class="plot-edit-line">
                  <input type="range" v-model="state.borderWidth" :min=0 :max=10 :step=1 />
                </div>
                <div class="plot-edit-title">透明度</div>
                <div class="plot-edit-line">
                  <input type="range" v-model="state.opacity" :min=0 :max=1 :step=0.1 />
                </div>
              </div>
            </div>
            <div class="ol-plot-vue-workspace-text-control" v-else-if="selected === 'TextArea'">
              <div class="plot-edit">
                <div class="plot-edit-color">
                  <span class="stration span-background">背景色</span>
                  <color-picker :color-format="'rgb'" v-model="state.textAreaBackgroundColor"></color-picker>
                  <span class="stration span-border">边框色</span>
                  <color-picker :color-format="'rgb'" v-model="state.textAreaBorderColor"></color-picker>
                </div>
                <div class="plot-edit-text">
                  <span class="stration font-color span-color">字体颜色</span>
                  <color-picker :color-format="'rgb'" v-model="state.textAreaColor"></color-picker>
                  <span class="stration font-size span-size">字体大小</span>
                  <input type="number" v-model="state.textAreaFontSize" />
                </div>
                <div class="plot-edit-title">边框线宽</div>
                <div class="plot-edit-line">
                  <input type="range" v-model="state.textAreaBorderWidth" :min=0 :max=10 :step=1 />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import 'ol-plot/dist/ol-plot.css';
import Plot from 'ol-plot';

import { defineComponent, ref, onMounted, shallowRef, reactive, watch } from 'vue-demi';
import ColorPicker from "./ColorPicker/index.vue";

export default defineComponent({
  name: 'olPlotVue',
  components: {
    ColorPicker,
  },
  setup() {
    const plot = shallowRef();
    const currentTextArea = shallowRef();

    const getImage = (name: string): string => {
      const modules: any = import.meta.globEager('./assets/img/*');
      const path = (`./assets/img/${name}.png`);
      return modules[path].default
    }

    const props = withDefaults(defineProps<{
      plots: any;
      map: any;
    }>(), {
      plots: [
        {
          "id": "Point",
          "name": "目标",
          "alias": "Point",
          "src": "Point"
        },
        {
          "id": "AttackArrow",
          "name": "进攻方向",
          "alias": "AttackArrow",
          "src": "AttackArrow"
        },
        {
          "id": "AssaultDirection",
          "name": "直箭头",
          "alias": "AssaultDirection",
          "src": "AssaultDirection"
        },
        {
          "id": "FineArrow",
          "name": "斜箭头",
          "alias": "FineArrow",
          "src": "FineArrow"
        },
        {
          "id": "DoubleArrow",
          "name": "双箭头",
          "alias": "DoubleArrow",
          "src": "DoubleArrow"
        },
        {
          "id": "StraightArrow",
          "name": "细直箭头",
          "alias": "StraightArrow",
          "src": "StraightArrow"
        },
        {
          "id": "TailedAttackArrow",
          "name": "燕尾曲箭头",
          "alias": "TailedAttackArrow",
          "src": "TailedAttackArrow"
        },
        {
          "id": "SquadCombat",
          "name": "曲箭头",
          "alias": "SquadCombat",
          "src": "SquadCombat"
        },
        {
          "id": "RectAngle",
          "name": "矩形",
          "alias": "RectAngle",
          "src": "RectAngle"
        },
        {
          "id": "Circle",
          "name": "圆形",
          "alias": "Circle",
          "src": "Circle"
        },
        {
          "id": "Ellipse",
          "name": "椭圆形",
          "alias": "Ellipse",
          "src": "Ellipse"
        },
        {
          "id": "Polygon",
          "name": "多边形",
          "alias": "Polygon",
          "src": "Polygon"
        },
        {
          "id": "GatheringPlace",
          "name": "集结地",
          "alias": "GatheringPlace",
          "src": "GatheringPlace"
        },
        {
          "id": "Sector",
          "name": "扇形",
          "alias": "Sector",
          "src": "Sector"
        },
        {
          "id": "Arc",
          "name": "弓形",
          "alias": "Arc",
          "src": "Arc"
        },
        {
          "id": "FreePolygon",
          "name": "自由面",
          "alias": "FreePolygon",
          "src": "FreePolygon"
        },
        {
          "id": "FreeHandLine",
          "name": "自由线",
          "alias": "FreeHandLine",
          "src": "FreeHandLine"
        },
        {
          "id": "Polyline",
          "name": "线",
          "alias": "Polyline",
          "src": "Polyline"
        },
        {
          "id": "Curve",
          "name": "曲线",
          "alias": "Curve",
          "src": "Curve"
        },
        {
          "id": "RectFlag",
          "name": "矩形标志旗",
          "alias": "RectFlag",
          "src": "RectFlag"
        },
        {
          "id": "TriangleFlag",
          "name": "三角标志旗",
          "alias": "TriangleFlag",
          "src": "TriangleFlag"
        },
        {
          "id": "CurveFlag",
          "name": "曲线标志旗",
          "alias": "CurveFlag",
          "src": "CurveFlag"
        },
        {
          "id": "TextArea",
          "name": "气泡",
          "alias": "TextArea",
          "src": "TextArea"
        }
      ],
      map: null,
    });

    const emits = defineEmits<{
      (e: 'close'): void;
      (e: 'showMin'): void;
    }>();

    const selected = ref();

    const state = reactive({
      title: '应急标绘',
      height: 40,
      backgroundColor: '#20a0ff',
      borderColor: '#20a0ff',
      borderWidth: 1,
      opacity: 1,
      textAreaBackgroundColor: 'rgb(255, 255, 255)',
      textAreaBorderColor: 'rgb(238, 238, 238)',
      textAreaColor: 'rgb(1, 5, 0)',
      textAreaFontSize: 12,
      textAreaBorderWidth: 1,
    });

    watch(() => state.borderWidth, (v) => {
      if (!plot.value) return;
      plot.value.plotUtils.setBorderWidth(plot.value.plotEdit.activePlot, v);
    });

    watch(() => state.opacity, (v) => {
      if (!plot.value) return;
      plot.value.plotUtils.setOpacity(plot.value.plotEdit.activePlot, v);
    });

    watch(() => state.backgroundColor, (v) => {
      if (!plot.value) return;
      plot.value.plotUtils.setBackgroundColor(plot.value.plotEdit.activePlot, v);
    });

    watch(() => state.borderColor, (v) => {
      if (!plot.value) return;
      plot.value.plotUtils.setBorderColor(plot.value.plotEdit.activePlot, v);
    });

    watch(() => state.textAreaBackgroundColor, (v) => {
      if (!currentTextArea.value || !v) return;
      currentTextArea.value.setStyle({
        background: v
      });
    });

    watch(() => state.textAreaBorderColor, (v) => {
      if (!currentTextArea.value || !v) return;
      currentTextArea.value.setStyle({
        border: state.textAreaBorderWidth + 'px' + ' solid ' + v,
      });
    });

    watch(() => state.textAreaColor, (v) => {
      if (!currentTextArea.value || !v) return;
      currentTextArea.value.setStyle({
        color: v,
      });
    });

    watch(() => state.textAreaFontSize, (v) => {
      if (!currentTextArea.value || !v) return;
      currentTextArea.value.setStyle({
        fontSize: v + 'px',
      });
    });

    watch(() => state.textAreaBorderWidth, (v) => {
      if (!currentTextArea.value || !v) return;
      currentTextArea.value.setStyle({
        border: v + 'px' + ' solid ' + state.textAreaBorderColor,
      });
    });

    /**
     * 刷新矢量图形样式
     * @param style
     */
    const refresh = (style: any) => {
      if (style) {
        if (style['fill']) {
          state.opacity = style['fill']['opacity'] || state.opacity;
          state.backgroundColor = style['fill']['fillColor'] || state.backgroundColor;
        }
        if (style['stroke']) {
          state.borderWidth = style['stroke']['strokeWidth'] || state.borderWidth;
          state.borderColor = style['stroke']['strokeColor'] || state.borderColor;
        }
      }
    };

    /**
     * 更改标绘激活的类型
     * @param item
     */
    const changeSelectedItem = (item: any) => {
      selected.value = item['alias']
      if (item['alias']) {
        plot.value.plotEdit.deactivate()
        plot.value.plotDraw.active(item['alias'])
      } else {
        console.warn('不存在的标绘类型！')
      }
    }

    /**
     * 激活面板
     * @param feature
     */
    const activeToolPanel = (feature: any) => {
      if (feature && feature.getGeometry()) {
        const type = feature.getGeometry().getPlotType()
        if (type) {
          selected.value = type
        }
        refresh(plot.value.plotUtils.getStyleCode(feature))
      }
    }

    /**
     * 刷新文本框样式
     * @param overlay
     */
    const refreshTextArea = (overlay: any) => {
      if (overlay) {
        const _style = overlay.getStyle();
        if (_style) {
          if (_style['fontSize']) {
            state.textAreaFontSize = parseInt(_style['fontSize']);
          }
          if (_style['color']) {
            state.textAreaColor = _style['color'];
          }
          if (_style['border']) {
            let _border = _style['border'].split(' ');
            _border.every((item: any) => {
              if (item.indexOf('px')) {
                state.textAreaBorderWidth = parseInt(item);
                return false
              } else {
                return true
              }
            })
            state.textAreaBorderColor = _style['border'].slice(_style['border'].indexOf('rgb('), _style['border'].indexOf(')') + 1);
          }
          if (_style['background']) {
            state.textAreaBackgroundColor = _style['background'].slice(_style['background'].indexOf('rgb('), _style['background'].indexOf(')') + 1);
          }
        }
      }
    }

    /**
     * 监听绘制结束事件
     * @param feature
     */
    const onDrawEnd = ({ feature }: any) => {
      // 开始编辑
      if (feature) {
        plot.value.plotEdit.activate(feature)
        activeToolPanel(feature)
      }
    }

    /**
     * 激活文本框编辑
     * @param overlay
     */
    const activeTextArea = ({ overlay }: any) => {
      currentTextArea.value = overlay;
      selected.value = 'TextArea';
      refreshTextArea(overlay);
      plot.value.plotEdit.deactivate();
    }

    /**
     * 地图点击事件处理图形编辑状态
     * @param event
     */
    const handleClick = (event: any) => {
      const feature = props.map.forEachFeatureAtPixel(event.pixel, (f: any) => f);
      if (feature && feature.get('isPlot')) {
        plot.value.plotEdit.activate(feature)
        activeToolPanel(feature)
      } else {
        plot.value.plotEdit.deactivate();
      }
      currentTextArea.value = null;
    }

    /**
     * 初始化标绘工具
     */
    function init() {
      const { map } = props;
      if (!plot.value) {
        /* eslint new-cap: 0 */
        plot.value = new Plot(props.map, {
          zIndex: 999,
          zoomToExtent: true
        });
        plot.value.plotDraw.drawLayer.setStyle(new Plot.StyleFactory({
          fill: {
            fillColor: '#8BA2E4'
          },
          stroke: {
            strokeColor: '#1B9DE8',
            strokeWidth: 2.5
          },
          image: {
            type: 'icon',
            image: {
              imageAnchor: [0.5, 0.5],
              imageAnchorXUnits: 'fraction',
              imageAnchorYUnits: 'fraction',
              imageOpacity: 0.75,
              imageSrc: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpmODA3ZDlmZS1mOTRhLTRmZDktOWYwYS05ZTk3NjdkYTUxMjUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDM3RkNGQUJDOEUyMTFFNkIwMDFGOUI0RDhFQUI4NEYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDM3RkNGQUFDOEUyMTFFNkIwMDFGOUI0RDhFQUI4NEYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ZDc5MmU0ODgtMzAxNC1kNDRiLWI4OWEtYmIxMzNhYWIyYjI1IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjU1YWEwNTQ3LTlmMGQtNDllYS1hOGI4LTRkZWRhMmU1OGRiMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PoW3u00AAAMESURBVHja7FdLaFNBFJ2Z1/eapCnUam0V6cYWEdd+FkUK4kIRF4pLxeJOV4IbpaDQgoiCK9d+loIIKi4V3CmuRJCCImpRW2ur5NP83oznJE1IXmZqEsVuvBA67717z5k5987cqTTGiLUwJdbI1oy4q/7h4INFp+PmHm/7csmczIVmbyE0I6ERG/jek2Ih8OTbmCefxbvkrc+Z8I0L4/Hhfjuxg3BrqqgvA/CoTSFOABPib89SXpzrDeS9Xl+dh/+7jqUeiKvjX7Lhq1TBHGsxLYq+iHmN2NMdEa+PqYvflvVtFH2i3fwhJobYG/0xNdUWMWf7PacvYSj/pIAWc3oSWGdaIh5KqNGFnL72t6oXWFeJuWpV09JFcx1SxW0gXH7SlyKBn68qYhS1EdmiYZwwdtnjKWBieMi54i1JbxsADthIsW3EYEKJvm4lApDKlYlwzHf85jkSkwEmsZ3E2ZI5YZNfVvJeW6XN+I0+Dg+1gm2XGntx3BaVrJOWhr0qxjYFkFmI53MFgS1UI6cvpG3CiGI3ECNfIzZi5rR+EpM7k2V5afuHAzH1Il3OcdXXRhzFbpA11GKdjTioW+2uQb9GSuOY7+olt1kUO5pPa480v3HopLE2EHtK/LQ5cctU7eVcUeBwqT1zzHc23wj2D2eOIdNMSZuBaBD3adBdkZD5m0ZOdw/5bBBlUlRs/dZxVf2Mkxit7Qmqb8xyqKBoTC3XJHo6W2gCL2C1LmJiO6VGP70DaG3L4cKyLgO7jN/oY+wnXkhsJzF7aI8vH1qrEojzWS2W8lrk8cDZ8ccx3/Fb6JgXMB9F+3PTWY3tcTZbCvdhAUnbytMr53LL1StFmpjpYrh6d5pNh+83xtUpm+TtGjGIRcyW+vHXrL6LJn6hwy1aE4gYxGrrBoL9eQWH/gSkyrR9OCCGscTo6M7Fqw+k2oGmcJ+V2YK0IX0Zw9iWr7cO2T/gzxHcIobRjSZwvR3H9XYUFdwHopIn5bzviU+83vpK3IT/x2q3WnWS//+F+Vf2S4ABAMe7cI4Rhe5DAAAAAElFTkSuQmCC'
            }
          }
        }));
        plot.value.plotDraw.on('drawEnd', onDrawEnd);
        plot.value.on('activeTextArea', activeTextArea);
        plot.value.on('deactivateTextArea', activeTextArea);
        map.un('click', handleClick);
        map.on('click', handleClick);
      }
    }

    if (props.map) {
      init();
    }

    onMounted(() => {
      if (props.map) {
        init();
      }
    });

    const closeFunc = () => {
      emits('close')
    }

    const minFunc = () => {
      emits('showMin')
    }

    const mouseOverHandle = (item: any) => {
      item.mouseover = true;
    }

    const mouseOutHandle = (item: any) => {
      item.mouseover = false;
    }
  },
});
</script>

<style scoped lang="less">
.ol-plot-vue {
  position: absolute;
  width: 390px;
  right: 15px;
  top: 20px;
  bottom: 80px;
  overflow: hidden;
  border-radius: 3px;
  box-shadow: 0 1px 0 0 rgba(0,0,0,.12),
  0 5px 10px -3px rgba(0,0,0,.3);
  pointer-events: auto;
  background: #fff;
  z-index:1;
  .panel-header {
    height: 80px;
    line-height: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #FFFFFF;
    padding: 0 20px;
    font-size: 16px;
    font-weight: bold;
    background: #1b9de8;
    .title {
      display: inline-block;
      font-size: 14px;
      margin-left: 5px;
    }
    .icon-fanhui1 {
      margin-right: 10px;
      line-height: 14px;
      height: 14px;
      font-size: 14px;
      transition: .3s;
      &:hover {
        cursor: pointer;
        color: #07C8C7;
      }
    }
    .icon-guanbi {
      position: absolute;
      right: 20px;
      top: 25px;
      line-height: 14px;
      height: 14px;
      font-size: 14px;
      transition: .3s;
      &:hover {
        cursor: pointer;
        color: #07C8C7;
      }
    }
    .icon-zuixiaohua {
      position: absolute;
      right: 44px;
      top: 25px;
      line-height: 14px;
      height: 14px;
      font-size: 14px;
      transition: .3s;
      &:hover {
        cursor: pointer;
        color: #07C8C7;
      }
    }
  }
  .panel-content {
    width: 100%;
    height: calc(100% - 80px);
    .ol-plot-vue-workspace {
      height: 100%;
      &-header {
        .tool-bar {
          height: 60px;
          line-height: 60px;
          padding: 0 20px;
          .icon-tupianzuofan {
            &:before {
              margin-right: 10px;
            }
            &:hover {
              cursor: pointer;
              color: #1B9DE8;
            }
          }
          .save-scheme {
            margin-left: 180px;
          }
        }
        .ol-plot-vue-workspace-title {
          height: 100px;
          line-height: 25px;
          padding: 0 30px;
        }
      }
      .plot-list-wrap {
        padding: 0 30px;
        .plot-list {
          ul {
            margin: auto;
            padding: 0;
            background: #FFFFFF;
            li {
              float: left;
              width: 54px;
              height: 60px;
              color: #818181;
              margin-left: 0px;
              box-sizing: border-box;
              border: 1px transparent solid;
              text-align: center;
              span:nth-child(1) {
                width: 25px;
                height: 25px;
                display: block;
                margin: auto;
                margin-top: 10px;
                background-size: 100% 100%!important;
              }
              span:nth-child(2) {
                display: inline-block;
                width: 100%;
                overflow: hidden;
                text-overflow:ellipsis;
                white-space: nowrap;
              }
              span {
                margin-top: 4px;
                display: block;
              }
              &:hover {
                cursor: pointer;
                background: #FFF;
                color: #1B9DE8;
                border: 1px #76c4f1 solid;
              }
            }

            .ol-plot-vue-selected {
              background: #FFF;
              color: #1B9DE8;
              border: 1px #76c4f1 solid;
            }
          }
          .qipao1 {
            width: 40px;
            height: 36px;
            margin: auto;
            margin-top: 4px;
            font-size: 27px;
          }
        }
      }
      .plot-edit {
        margin-top: 15px;
        .plot-edit-color {
          text-align: left;
          padding: 0 0 0 15px;
          color: #3a3a3a;
          display: flex;
          align-items: center;
          .stration {
            width: 60px;
            display: inline-block;
          }
          .demonstration {
            position: relative;
            top: 4px;
          }
          .span-border {
            margin-left: 40px;
          }
          label {
            display: inline-block;
            margin: 0 15px;
            &[for="plotBorderColor"] {
              margin-left: 70px;
            }
          }
        }

        .plot-edit-text {
          text-align: left;
          margin: 10px 0px;
          padding: 0 0 0 15px;
          color: #3a3a3a;
          display: flex;
          align-items: center;
          .stration {
            display: inline-block;
            width: 60px;
          }
          .font-color {
          }

          .font-size {
            margin-left: 40px;
          }

          .span-border {
            margin-left: 50px;
          }
          label {
            display: inline-block;
            margin: 0 15px;
            &[for="plotBorderColor"] {
              margin-left: 70px;
            }
          }
        }

        .min-input {
          width: 30px;
          height: 30px;
          margin: 0;
          padding: 0;
          text-align: center;
          border: 1px solid #e3e3e3;
        }

        .plot-edit-delete {
          margin: 20px 0 20px;
          padding: 0 15px;
          color: #3a3a3a;
        }
        .plot-edit-title {
          margin: 20px 0 10px;
          padding: 0 15px;
          color: #3a3a3a;
        }
        .plot-edit-line {
          padding: 0 32px 0 27px;
        }
        .plot-view-wrap {
          .plot-view-title {
            font-family: 'SimSun', Arial, sans-serif;
            font-weight: bold;
            margin-bottom: 10px;
            display: block;
            padding: 0 20px;
          }
          .plot-view-box {
            border: 1px dashed #E3E3E3;
            padding: 20px;
            text-align: center;
            width: 280px;
            margin: auto;
            background-image: linear-gradient(45deg, #E3E3E3 25%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0)),
            linear-gradient(-45deg, #E3E3E3 25%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0)),
            linear-gradient(45deg, rgba(0, 0, 0, 0) 75%, #E3E3E3 75%),
            linear-gradient(-45deg, rgba(0, 0, 0, 0) 75%, #E3E3E3 75%);
            background-size: 10px 10px;

            .iconfont {
              display: table;
              margin: auto;
              text-align: center;
              &:before {
                display: table-cell;
                vertical-align: middle;
              }
            }
          }
        }
      }
      &-scroll {
        width: calc(100% + 30px);
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        &-inner {
          width: 390px;
        }
      }
    }
  }
  .ol-plot-vue-null-data {
    text-align: center;
    height: 100%;
    line-height: 100%;
    padding-top: 50%;
    img {
      display: block;
      margin: 0 auto;
    }
    span {
      margin-bottom: 8px;
      color: #7ac2f1;
      display: block;
    }
    span:nth-child(1) {
      margin-top: 10px;
    }
  }
}
</style>
