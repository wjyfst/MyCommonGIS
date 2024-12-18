<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 16:08:11
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-12-18 16:32:06
 * @FilePath: \code\docs\views\esri\esriMapData.vue
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
    tilt: 45,
    callback: () => {
      loadPointLayerDemo()
    }
  })
});

onUnmounted(() => {
  mapUtil.destroyMap()
});
const loadPointLayerDemo = () => {
  mapUtil.loadPointLayer({
    layerid: 'pointLayer',
    data: [
      { lng: 116.397428, lat: 39.90923, name: 'point1' },
      { lng: 116.458428, lat: 39.90923, name: 'point2' },
      { lng: 116.366428, lat: 39.91923, name: 'point3' }
    ],
    iconCfg: {
      url:'../src/img/icon.png',
      width: 40,
      height: 50,
      offsetX: -20,
      offsetY: -50,
    },
    callback:(layer)=>{
      console.log(layer);
    }
  })
}

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