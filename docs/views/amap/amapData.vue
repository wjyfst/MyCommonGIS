<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 16:08:11
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-12-19 15:29:33
 * @FilePath: \code\docs\views\amap\amapData.vue
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
-->
<script setup>
import { onMounted, onUnmounted } from "vue";
import { MapUtil } from "../../src/map";

let mapUtil
onMounted(() => {
  mapUtil = new MapUtil('高德')
  mapUtil.initMap({
    center: [116.397428, 39.90923],
    zoom: 12,
    heading: -15,
    tilt: 45,
    callback: () => {
      loadPointLayerDemo()
    }
  })
})

onUnmounted(() => {
  mapUtil.destroyMap()
})
const loadPointLayerDemo = () => {
  mapUtil.loadPointLayer({
    layerid: 'pointLayer',
    sr: 'wgs84',
    data: [
      { lng: 116.40263981407037, lat: 39.9319649160779, name: 'point1' },
      { lng: 116.39125609711363, lat: 39.90734360237673, name: 'point2' },
      { lng: 116.39048947611673, lat: 39.92137584534936, name: 'point3' },
      { lng: 116.37116642734117, lat: 39.921171821696646, name: 'point4' },
    ],
    iconCfg: {
      url: '../src/img/icon.png',
      width: 40,
      height: 50,
      offsetX: -20,
      offsetY: -50,
    },
    callback: (layer) => {
      console.log(mapUtil);
    }
  })
}

</script>

<template>
  <div id="container"></div>
</template>

<style scoped>
#container {
  width: 100%;
  height: 400px;
}
</style>