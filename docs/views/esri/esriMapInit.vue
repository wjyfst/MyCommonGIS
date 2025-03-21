<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { MapUtil } from "../../src/map";
const mapUtil = ref(new MapUtil('易智瑞'));

onMounted(() => {
  mapUtil.value.initMap({
    center: [116.397428, 39.90923],
    zoom: 12,
    heading: -15,
    tilt: 45
  });
});

onUnmounted(() => {
  mapUtil.value.destroyMap();
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