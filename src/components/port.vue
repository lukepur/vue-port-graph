<template>
  <circle :cx="port.point.x" :cy="port.point.y" :r="radius" class="port" :class="port.type" @click="handlePortClick" >
  </circle>
</template>

<script>
export default {
  name: 'port',

  props: {
    port: Object, // { target: 'path', type: 'source|target', point: {x, y}}
    radius: Number,
    onConnection: {
      type: Function,
      default: () => {}
    }
  },

  methods: {
    handlePortClick (e) {
      console.log('port:', this.port, 'clicked');
      this.onConnection(this.port);
    }
  }
}
</script>

<style>
.port {
  fill: #fff;
  stroke: #7a93a9;
  stroke-width: 3;
  cursor: move;
}
</style>
