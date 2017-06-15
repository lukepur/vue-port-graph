<template>
  <circle :cx="port.point.x"
          :cy="port.point.y"
          :r="radius"
          class="port"
          :class="`${dragClass} ${dragCandidateClass} ${dragTargetClass}`"
          @mouseup="onmouseup"
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
    onmouseup () {
      console.log('mouseup', this);
      if (this.mouseover && this.port.isCandidate) {
        this.onPortDropTarget(this.port);
      }
    },

    handlemouseenter () {
      console.log('adding listener');
      // window.addEventListener('mouseup', this.onmouseup, true);
      this.mouseover = true;
    },

    handlemouseleave () {
      this.mouseover = false;
      console.log('removing listener');
      // window.removeEventListener('mouseup', this.onmouseup, true);
    },
  },

  mounted () {
    const dragBehaviour = drag()
      .on('start', e => {
        console.log('drag started for port:', this.port);
        this.onPortDragStart(this.port);
        this.dragging = true;
      })
      .on('drag', () => {
        this.onPortDrag(this.port, event)
      })
      .on('end', () => {
        this.onPortDragEnd(this.port);
        this.dragging = false;
      });
    // select(this.$el)
    //   .call(dragBehaviour);
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
