<!--
 * @Author: Wang_Jinyao && wjyzzuer@163.com
 * @Date: 2024-07-24 16:08:11
 * @LastEditors: Wang_Jinyao && wjyzzuer@163.com
 * @LastEditTime: 2024-09-27 11:24:35
 * @FilePath: \code\docs\views\amap\amapInit.vue
 * @Description: 
 * 
 * Copyright (c) 2024 by Wang_Jinyao, All Rights Reserved. 
-->
<script setup>
import { onMounted, onUnmounted } from "vue";

let mapUtil
onMounted(() => {
  import('../../src/map').then(module => {
    mapUtil = new module.MapUtil('高德')
    mapUtil.initMap({
      center: [116.397428, 39.90923],
      zoom: 12,
      heading: -15,
      tilt: 45,
    })
  })
})

onUnmounted(() => {
  mapUtil.destroyMap()
})

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