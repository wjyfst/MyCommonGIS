<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { MapUtil } from "../../src/map";

const mapUtil = ref(new MapUtil('易智瑞'));

onMounted(() => {
  mapUtil.value.initMap({
    center: [119.89283, 29.22381],
    zoom: 8,
    heading: -15,
    tilt: 45,
    callback: () => {
      loadWMSTileLayer();
    }
  });
});

onUnmounted(() => {
  mapUtil.value.destroyMap();
});

const loadWMSTileLayer = () => {
  mapUtil.value.loadTileLayer({
    layerid: 'wmsLayer',
    url: '/geoserver/tiff/wms',
    type: 'wms',
    sublayers: [{ name: 'tiff:Jinhua_30DEM_Render2' }],
    callback: (layer) => {
      console.log(layer);
    }
  });
};
</script>

<template>
  <div id="viewDiv"></div>
</template>

<style scoped>
#viewDiv {
  padding: 0;
  margin: 0;
  height: 400px;
  width: 100%;
}
</style>