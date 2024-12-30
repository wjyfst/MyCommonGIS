<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 16:08:11
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-12-30 15:16:34
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
      loadLineLayerDemo()
      loadPolygonLayerDemo()
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
    onclick: (e) => {
      console.log(e);
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
        [116.40263981407037, 39.9319649160779, 0],
        [116.39125609711363, 39.90734360237673, 0],
        [116.39048947611673, 39.92137584534936, 0],
        [116.37116642734117, 39.921171821696646, 0]
      ]
    ],
    sr: 'wgs84',
    style: {
      width: 5,
      color: '#00ff00'
    }
  })
}
const loadPolygonLayerDemo = () => {
  mapUtil.loadPolygonLayer({
    layerid: 'PolygonLayer',
    data: [
      {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "coordinates": [
            [
              [116.38912144545418, 39.90681206805624],
              [116.36966719920929, 39.90296952809362],
              [116.38364585230448, 39.89733861564295],
              [116.40403492448968, 39.89613113615823],
              [116.4027431028382, 39.90640997644326],
              [116.40466374529433, 39.91132232382836],
              [116.39319827077111, 39.90216520312279],
              [116.38912144545418, 39.90681206805624]
            ]
          ],
          "type": "Polygon"
        }
      }
    ],
    style: {
      fillColor: '#00B2D5',
      fillOpacity: '0.5',
      strokeColor: '#00D3FC',
      strokeWeight: 2,
    },
    sr: 'wgs84',
    onclick: (e) => {
      console.log(e);
    },
    callback: (layer) => {
      console.log(layer);
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