<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { MapUtil } from "../../src/map";
const mapUtil = ref(new MapUtil('高德'));

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
  <div id="container"></div>
</template>

<style scoped>
#container {
  width: 100%;
  height: 400px;
}
</style>