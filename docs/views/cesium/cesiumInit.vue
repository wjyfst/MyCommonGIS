<script setup>
// Add Cesium CSS imports
import "cesium/Build/Cesium/Widgets/widgets.css";
import { onMounted, onUnmounted, ref } from "vue";
import { MapUtil } from "../../src/map";
const mapUtil = ref(new MapUtil('cesium'));

onMounted(() => {
  mapUtil.value.initMap({
    container:'cesiumViewDiv',
    center: [116.397428, 39.90923],
    zoom: 12,
    heading: -15,
    tilt: 45,
  });
});

onUnmounted(() => {
  mapUtil.value.destroyMap();
});
</script>

<template>
  <div id="cesiumViewDiv"></div>
</template>

<style scoped>
#cesiumViewDiv {
  width: 100%;
  height: 400px;
}
</style>