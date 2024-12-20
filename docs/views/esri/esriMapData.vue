<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 16:08:11
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-12-20 15:40:59
 * @FilePath: \code\docs\views\esri\esriMapDataPoints.vue
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
-->
<script setup>
import { onMounted, onUnmounted, ref } from "vue";
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
      loadLineLayerDemo()
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
      console.log(layer);
    }
  })
}
const loadLineLayerDemo = () => {
  mapUtil.loadLineLayer({
    layerid: 'PolylineLayer',
    lines: [
      [
        [116.40263981407037, 39.9319649160779,0],
        [116.39125609711363, 39.90734360237673,0],
        [116.39048947611673, 39.92137584534936,0],
        [116.37116642734117, 39.921171821696646,0]
      ]
    ],
    style: {
      width: 5,
      color: '#00ff00'
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