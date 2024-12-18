<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 16:08:11
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-10-28 16:23:18
 * @FilePath: \code\docs\views\esri\esriMapInit.vue
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
-->
<script setup>
import { onMounted, onUnmounted } from "vue";
import { MapUtil } from "../../src/map";

let mapUtil
onMounted(() => {
  mapUtil = new MapUtil('ArcGIS')
  mapUtil.initMap({
    center: [116.397428, 39.90923],
    zoom: 12,
    heading: -15,
    tilt: 45
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
  width: 100%;}
</style>