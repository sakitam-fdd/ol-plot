<template>
  <div id="main-map" class="map-box">
    <ol-plot-vue v-if="inited" :map="map" />
  </div>
</template>

<script lang="ts">
  import 'ol/ol.css';
  import { Map, View } from 'ol';
  import { Tile } from 'ol/layer';
  import { OSM } from 'ol/source';
  import { fromLonLat } from 'ol/proj';
  import { defineComponent, onMounted, shallowRef, ref } from 'vue';

  export default defineComponent({
    setup() {
      const map = shallowRef();
      const view = shallowRef();

      const inited = ref(false);

      const initMap = () => {
        view.value = new View({
          center: fromLonLat([113.534501, 34.441045]),
          zoom: 4,
        });
        map.value = new Map({
          target: 'main-map',
          layers: [
            new Tile({
              visible: true,
              source: new OSM(),
            }),
          ],
          view: view.value,
        });
        inited.value = true;
      };

      onMounted(() => {
        initMap();
      });

      return {
        inited,
        map,
      };
    },
  });
</script>

<style lang="less">
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  .map-box {
    position: absolute;
    inset: 0;
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-family: Helvetica Neue For Number, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, PingFang SC,
      Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif;
    font-size: 12px;
    line-height: 1.5;
    color: #3a3a3a;
  }
</style>
