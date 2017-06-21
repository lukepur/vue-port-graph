<template>
<g @xdrop="handledrop"
   @mouseenter="handlemouseenter"
   @mouseleave="handlemouseleave"
   class="node">
  <rect :x="node.x" :y="node.y"
        rx="5" ry="5"
        :width="node.width"
        :height="node.height"
        :class="`${dragCandidateClass} ${dropTargetClass}`"
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
import { drag } from 'd3-drag';
import { select, event } from 'd3-selection';

export default {
  name: 'node',

  props: {
    node: Object,
    onNodeDragStart: {
      type: Function,
      default: () => {}
    },
    onNodeDrag: {
      type: Function,
      default: () => {}
    },
    onNodeDragEnd: {
      type: Function,
      default: () => {}
    },
    onNodeDropTarget: {
      type: Function,
      default: () => {}
    }
  },

  data () {
    return {
      dragging: false,
      mouseover: false
    };
  },

  computed: {
    dragCandidateClass () {
      return this.node.isCandidate ? 'drag-candidate' : '';
    },

    dropTargetClass () {
      return this.mouseover && this.node.isCandidate ? 'drag-target' : '';
    }
  },

  methods: {
    handledrop () {
      if (this.mouseover && this.node.isCandidate) {
        this.onNodeDropTarget({ type: 'node', data: { ...this.node } });
      }
    },

    handlemouseenter () {
      this.mouseover = true;
    },

    handlemouseleave () {
      this.mouseover = false;
    }
  },

  mounted () {
    const dragBehaviour = drag()
      .on('start', e => {
        this.onNodeDragStart(this.node);
        this.dragging = true;
      })
      .on('drag', () => {
        this.onNodeDrag(event)
      })
      .on('end', () => {
        this.onNodeDragEnd(this.node);
        this.dragging = false;
        // dispatch drop event to target
        const { sourceEvent } = event;
        sourceEvent.path[0].dispatchEvent(new Event('xdrop', { bubbles: true }));
      })
    select(this.$el)
      .call(dragBehaviour);
  }
}
</script>

<style>
.node rect {
  stroke: #7a93a9;
  stroke-width: 4;
  fill: #fff;
}

.node text {
  cursor: default;
}

.dragging .node rect {
  stroke: #d3d3d3;
}

.dragging rect.drag-candidate {
  stroke: #1c6fb9;
}

.dragging rect.drag-candidate.drag-target {
  stroke: #63a263;
}
</style>
