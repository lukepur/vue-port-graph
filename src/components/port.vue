<template>
  <circle :cx="port.point.x"
          :cy="port.point.y"
          :r="radius"
          class="port"
          :class="`${dragClass} ${dragCandidateClass} ${dragTargetClass}`"
          @xdrop="handledrop"
          @mouseenter="handlemouseenter"
          @mouseleave="handlemouseleave" />
  </circle>
</template>

<script>
import { drag } from 'd3-drag';
import { select, event } from 'd3-selection';

export default {
  name: 'port',

  data () {
    return {
      dragging: false,
      mouseover: false
    };
  },

  props: {
    port: {
      type: Object,
      default: () => ({ isCandidate: false })
    }, // { target: 'path', type: 'source|target', point: {x, y}}
    radius: Number,
    onPortDragStart: {
      type: Function,
      default: () => {}
    },
    onPortDrag: {
      type: Function,
      default: () => {}
    },
    onPortDragEnd: {
      type: Function,
      default: () => {}
    },
    onPortDropTarget: {
      type: Function,
      default: () => {}
    },
    onConnection: {
      type: Function,
      default: () => {}
    }
  },

  computed: {
    dragClass () {
      return this.dragging ? 'dragging' : '';
    },

    dragCandidateClass () {
      return this.port.isCandidate ? 'drag-candidate' : '';
    },

    dragTargetClass () {
      return this.mouseover && this.port.isCandidate ? 'drag-target' : '';
    }
  },

  methods: {
    handledrop () {
      if (this.mouseover && this.port.isCandidate) {
        this.onPortDropTarget(this.port);
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
        this.onPortDragStart(this.port);
        this.dragging = true;
      })
      .on('drag', () => {
        this.onPortDrag(this.port, event)
      })
      .on('end', () => {
        this.onPortDragEnd(this.port);
        this.dragging = false;
        // dispatch drop event to target
        const { sourceEvent } = event;
        sourceEvent.path[0].dispatchEvent(new Event('xdrop'));
      })
    select(this.$el)
      .call(dragBehaviour);
  }
}
</script>

<style scoped>
.port {
  fill: #fff;
  stroke: #7a93a9;
  stroke-width: 3;
}

.dragging {
  fill: #1c6fb9;
}

.port-dragging .port {
  stroke: #d3d3d3;
}

.port-dragging .drag-candidate {
  stroke: #1c6fb9;
}

.port-dragging .drag-candidate.drag-target {
  stroke: #63a263;
}

</style>
