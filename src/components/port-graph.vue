<template>
  <div class="graph" :class="`${portDraggingClass}`">
    <svg :width="layout.graph().width + (2 * padding)" :height="layout.graph().height + (2 * padding)">
      <g :transform="`translate(${padding}, ${padding})`">
        <Node v-for="(node, index) in nodes" :node="node" :key="index" />
        <Edge v-for="(edge, index) in edges" :edge="edge" :key="index" />
        <path :d="dragPathAsSvg" class="drag-path" />
        <Port v-for="(port, index) in ports"
              :port="port"
              :radius="portRadius"
              :key="index"
              :onPortDragStart="handlePortDragStart"
              :onPortDrag="handlePortDrag"
              :onPortDragEnd="handlePortDragEnd"
              :onPortDropTarget="handleDropTarget" />
      </g>
    </svg>
  </div>
</template>

<script>
import dagre from 'dagre';
import { find, last, merge } from 'lodash';

import Node from './node.vue';
import Edge from './edge.vue';
import Port from './port.vue';

import { applyNewPortConnection, isGraphAcyclic } from '../helpers/graph-helpers';

const DUMMY_PREFIX = 'dummy_';
const DEFAULT_OPTS = {
  nodeWidth: 200,
  nodeHeight: 40,
  portRadius: 10,
  graphPadding: 20,
  dagre: {
    nodesep: 2 * 10
  }
};

export default {
  name: 'PortGraph',

  data () {
    return {
      portBeingDragged: null,
      dragCandidates: [],
      dragPath: emptyDragPath()
    };
  },

  props: {
    graphConfig: {
      type: Object,
      default: () => ({ nodes: [], edges: [], options: {} })
    },
    onPortConnection: {
      type: Function,
      default: () => {}
    }
  },

  computed: {
    graphOptions () {
      const { options } = this.graphConfig;
      return merge({}, DEFAULT_OPTS, options);
    },

    layout () {
      const { nodes, edges } = this.graphConfig;
      const options = this.graphOptions;

      // init dagre graph
      const graph = new dagre.graphlib.Graph({ multigraph: true});
      graph.setGraph(options.dagre);
      graph.setDefaultEdgeLabel(() => ({}));

      let dummySeq = 0;

      // add dagre nodes
      nodes.forEach(node => {
        graph.setNode(node.id, { label: node.id, width: options.nodeWidth, height: options.nodeHeight });

        // add dummy nodes for unconnected ports
        node.ports.forEach(port => {
          if (!this.isPortConnected(port, node.id, edges)) {
            const dummyId = `${DUMMY_PREFIX}${dummySeq++}`;
            graph.setNode(dummyId, { width: options.portRadius * 4, height: 0 });
            if (port.type === 'input') {
              graph.setEdge(dummyId, node.id, { from: {}, to: { nodeId: node.id, portId: port.id } });
            } else {
              graph.setEdge(node.id, dummyId, { from: { nodeId: node.id, portId: port.id }, to: {} });
            }
          }
        });
      });

      // add dagre edges
      edges.forEach(edge => {
        graph.setEdge(edge.source.nodeId, edge.target.nodeId, {
          from: { ...edge.source },
          to: { ...edge.target }
        }, `${edge.source.nodeId}:${edge.source.portId}->${edge.target.nodeId}:${edge.target.portId}`)
      });

      // run layout
      dagre.layout(graph);

      return graph;
    },

    nodes () {
      return this.layout.nodes().map(n => ({
        x: this.nodeX(n),
        y: this.nodeY(n),
        width: this.layout.node(n).width,
        height: this.layout.node(n).height,
        label: n
      }))
      .filter(n => n.label ? !this.isDummyLabel(n.label) : true);
    },

    edges () {
      return this.layout.edges().map(e => ({
        ...this.layout.edge(e),
        sourceNode: find(this.nodes, { label: e.v }),
        targetNode: find(this.nodes, { label: e.w })
      }))
      // remove dummy edges
      .filter(e => e.sourceNode &&
                   e.targetNode &&
                   !this.isDummyLabel(e.sourceNode.label) &&
                   !this.isDummyLabel(e.targetNode.label));
    },

    ports () {
      const ports = [];
      this.layout.edges().forEach(edge => {
        const e = this.layout.edge(edge);
        const { v, w } = edge;
        if (!this.isDummyLabel(v)) {
          ports.push({
            ...e.from,
            isCandidate: this.isCandidate(e.from),
            point: this.layout.edge(edge).points[0],
            type: 'source'
          });
        }
        if (!this.isDummyLabel(w)) {
          ports.push({
            ...e.to,
            isCandidate: this.isCandidate(e.to),
            point: last(this.layout.edge(edge).points),
            type: 'target'
          });
        }
      });
      return ports;
    },

    padding () {
      return this.graphOptions.graphPadding;
    },

    portRadius () {
      return this.graphOptions.portRadius;
    },

    portDraggingClass () {
      return this.portBeingDragged ? 'port-dragging' : '';
    },

    dragPathAsSvg () {
      if (this.dragPath.start.x === null) return '';
      const { start, end } = this.dragPath;
      let path = `M${start.x} ${start.y}`;

      if (end) {
        path += ` L${end.x} ${end.y}`;
      }

      return path;
    }
  },

  methods: {
    isPortConnected (port, nodeId, edges) {
      return find(edges, edge => {
        const typeProp = port.type === 'input' ? 'target' : 'source';
        return edge[typeProp].nodeId === nodeId && edge[typeProp].portId === port.id;
      }) !== undefined;
    },

    isDummyLabel (label) {
      return label && label.indexOf && label.indexOf('dummy_') > -1;
    },

    isCandidate (port) {
      return find(this.dragCandidates, { nodeId: port.nodeId, portId: port.portId }) !== undefined;
    },

    nodeX (n) {
      const { x } = this.layout.node(n);
      return x - (this.layout.node(n).width / 2);
    },

    nodeY (n) {
      const { y } = this.layout.node(n);
      return y - (this.layout.node(n).height / 2);
    },

    handlePortDragStart (port) {
      this.portBeingDragged = { ...port };
      this.dragCandidates = this.ports.filter(p => p.type !== port.type && p.nodeId !== port.nodeId);
      this.dragPath = {
        start: {...port.point}
      };
    },

    handlePortDrag (port, evt) {
      this.dragPath = {
        ...this.dragPath,
        end: { x: evt.x, y: evt.y }
      };
    },

    handlePortDragEnd (port) {
      this.dragCandidates = [];
      this.dragPath = emptyDragPath();
      // clear on next tick to allow custom drop event to access source port
      this.$nextTick(() => {
        this.portBeingDragged = null;
      });
    },

    handleDropTarget (targetPort) {
      // here is where we tell the consumer what port was dropped onto another port
      const connection = {
        from: { ...this.portBeingDragged },
        to: { ...targetPort }
      };
      this.onPortConnection(connection);
    }
  },
  components: {
    Node,
    Edge,
    Port
  }
}

function emptyDragPath () {
  return {
    start: { x: null, y: null },
    end: { x: null, y: null }
  };
}
</script>

<style scoped>
.graph {
  user-select: none;
}

.drag-path {
  stroke: #1c6fb9;
  stroke-width: 3;
}
</style>
