<template>
<g>
  <rect :x="node.x" :y="node.y"
        rx="5" ry="5"
        :width="node.width"
        :height="node.height"
        class="node" />
  <text :x="node.x + node.width / 2"
        :y="node.y + node.height / 2"
        text-anchor="middle"
        dominant-baseline="middle">
    {{ node.label }}
  </text>
</g>
</template>

<script>
export default {
  name: 'node',

  props: {
    node: Object
  }
}
</script>

<style>
.node {
  stroke: #7a93a9;
  stroke-width: 4;
  fill: none;
}
</style>
