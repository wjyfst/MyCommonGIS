<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 16:08:11
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-09-11 16:54:52
 * @FilePath: \GIS\gis\views\esriMap.vue
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
-->
<script setup>
import { onMounted, onUnmounted } from "vue";

let mapUtil
onMounted(() => {
  import('../src/map').then(module => {
    mapUtil = module.mapUtil
    mapUtil.initMap({
      apiName: 'ArcGIS',
      center: [116.397428, 39.90923],
      zoom: 12,
      heading: -15,
      tilt: 45
    })
  })
});

onUnmounted(() => {
  mapUtil.destroyMap()
});
</script>

<template>
  <div id="viewDiv"></div>
</template>

<style scoped>
@import "https://js.arcgis.com/4.30/@arcgis/core/assets/esri/themes/light/main.css";
@import "https://js.arcgis.com/calcite-components/2.11.1/calcite.css";
#viewDiv {
  padding: 0;
  margin: 0;
  height: 400px;
  width: 100%;
}
</style>