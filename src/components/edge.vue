<template>
  <g class="edge">
    <path :d="svgPath"/>
  </g>
</template>

<script>
export default {
  name: 'edge',
  props: {
    edge: Object
  },
  computed: {
    svgPath () {
      const { edge } = this;
      const firstPoint = edge.points[0];
      let path = `M${firstPoint.x} ${firstPoint.y}`;
      for (let i = 1; i < edge.points.length; i++) {
        const point = edge.points[i];
        path += ` L${point.x} ${point.y}`;
      }
      return path;
    }
  }
}
</script>

<style>
.edge {
  stroke: #e67200;
  stroke-width: 3;
  fill: none;
}

.dragging .edge {
  stroke: #d3d3d3;
}
</style>
