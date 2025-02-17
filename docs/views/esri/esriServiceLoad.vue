<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 16:08:11
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2025-02-17 17:03:35
 * @FilePath: \devCode\docs\views\esri\esriServiceLoad.vue
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
-->
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { MapUtil } from "../../src/map";

let mapUtil
onMounted(() => {
  mapUtil = new MapUtil('易智瑞')
  mapUtil.initMap({
    center: [119.89283, 29.22381],
    zoom: 8,
    heading: -15,
    tilt: 45,
    callback: () => {
      loadWMSTileLayer()
    }
  })
});

onUnmounted(() => {
  mapUtil.destroyMap()
});
const loadWMSTileLayer = () => {
  mapUtil.loadTileLayer({
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