<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 16:08:11
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-12-25 14:48:42
 * @FilePath: \code\docs\views\esri\esriMapInit.vue
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
-->
<script setup>
import { onMounted, onUnmounted } from "vue";
import { MapUtil } from "../../src/map";
import '@geoscene/core/assets/geoscene/themes/light/main.css'

let mapUtil
onMounted(() => {
  mapUtil = new MapUtil('易智瑞')
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

#viewDiv {
  padding: 0;
  margin: 0;
  height: 400px;
  width: 100%;}
</style>