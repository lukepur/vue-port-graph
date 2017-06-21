<template>
<g :transform="`translate(${origin.x},${origin.y})`">
  <polygon class="port"
           :points="svgPoints"
           :transform="`rotate(${portDirection}, ${-originModifiers.x}, ${-originModifiers.y})`"
           :class="`${dragClass} ${dragCandidateClass} ${dragTargetClass}`"
           @xdrop="handledrop"
           @mouseenter="handlemouseenter"
           @mouseleave="handlemouseleave" />
</g>
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
      default: () => ({ isCandidate: false, point: {} })
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
    },

    originModifiers () {
      const { radius } = this;
      return {
        x: -radius,
        y: -(radius * 0.3)
      };
    },
    origin () {
      const { x, y } = this.port.point;
      return { x: x + this.originModifiers.x, y: y + this.originModifiers.y };
    },

    svgPoints () {
      const r = this.radius;
      return `0,0 ${r * 2},0 ${r},${r * 1.1}`;
    },

    portDirection () {
      const { port } = this;
      if (port.nextPoint) {
        return Math.atan2(port.nextPoint.y - port.point.y, port.nextPoint.x - port.point.x) * 180 / Math.PI - 90;
      }
      if (port.previousPoint) {
        return Math.atan2(port.point.y - port.previousPoint.y, port.point.x - port.previousPoint.x) * 180 / Math.PI - 90;
      }
      return 0;
    }
  },

  methods: {
    handledrop () {
      if (this.mouseover && this.port.isCandidate) {
        this.onPortDropTarget({ type: 'port', data: { ...this.port } });
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
        this.onPortDrag(event)
      })
      .on('end', () => {
        this.onPortDragEnd(this.port);
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

<style scoped>
.port {
  fill: #fff;
  stroke: #7a93a9;
  stroke-width: 2;
}

.dragging {
  fill: #1c6fb9;
}

.dragging .port {
  stroke: #d3d3d3;
}

.dragging .drag-candidate {
  stroke: #1c6fb9;
}

.dragging .drag-candidate.drag-target {
  stroke: #63a263;
}

</style>
