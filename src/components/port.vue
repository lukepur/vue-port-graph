<template>
  <circle :cx="port.point.x" :cy="port.point.y" :r="radius" class="port" :class="port.type">
  </circle>
</template>

<script>
export default {
  name: 'port',
  props: {
    port: Object, // { taget: 'path', type: 'source|target', point: {x, y}}
    radius: Number
  }
}
</script>

<style>
.port {
  fill: #fff;
  stroke: #7a93a9;
  stroke-width: 3;
}
</style>
