<template>
  <div class="graph" :class="`${draggingClass}`">
    <svg :width="layout.graph().width + (2 * padding)" :height="layout.graph().height + (2 * padding)">
      <g :transform="`translate(${padding}, ${padding})`">
        <Node v-for="(node, index) in nodes" :node="node" :key="index" 
              :onNodeDragStart="handleNodeDragStart"
              :onNodeDrag="handleDrag"
              :onNodeDragEnd="handleDragEnd"
              :onNodeDropTarget="handleDropTarget" />
        <Edge v-for="(edge, index) in edges" :edge="edge" :key="index" />
        <Port v-for="(port, index) in ports"
              :port="port"
              :radius="portRadius"
              :key="index"
              :onPortDragStart="handlePortDragStart"
              :onPortDrag="handleDrag"
              :onPortDragEnd="handleDragEnd"
              :onPortDropTarget="handleDropTarget" />
        <path :d="dragPathAsSvg" class="drag-path" />
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

const DUMMY_PREFIX = 'dummy_';
const DEFAULT_OPTS = {
  nodeWidth: 200,
  nodeHeight: 40,
  portRadius: 10,
  graphPadding: 20,
  dagre: {
    nodesep: 4 * 10
  }
};

export default {
  name: 'PortGraph',

  data () {
    return {
      beingDragged: null,
      portDropCandidates: [],
      nodeDropCandidates: [],
      dragPath: emptyDragPath()
    };
  },

  props: {
    graphConfig: {
      type: Object,
      default: () => ({ nodes: [], edges: [], options: {} })
    },
    onConnection: {
      type: Function,
      default: () => {}
    },
    filterDropCandidates: {
      type: Function
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
      const graph = new dagre.graphlib.Graph({ multigraph: true });
      graph.setGraph(options.dagre);
      graph.setDefaultEdgeLabel(() => ({}));

      let dummySeq = 0;

      // add dagre nodes
      nodes.forEach(node => {
        graph.setNode(node.id, { label: node.id, width: options.nodeWidth, height: options.nodeHeight, ...node });

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
        ...this.layout.node(n),
        x: this.nodeX(n),
        y: this.nodeY(n),
        width: this.layout.node(n).width,
        height: this.layout.node(n).height,
        label: n,
        isCandidate: this.isNodeCandidateId(n)
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
            isCandidate: this.isPortCandidate(e.from),
            point: this.layout.edge(edge).points[0],
            nextPoint: !this.isDummyLabel(w) ? this.layout.edge(edge).points[1] : null,
            type: 'source'
          });
        }
        if (!this.isDummyLabel(w)) {
          ports.push({
            ...e.to,
            isCandidate: this.isPortCandidate(e.to),
            point: last(this.layout.edge(edge).points),
            previousPoint: !this.isDummyLabel(v) ? this.layout.edge(edge).points[this.layout.edge(edge).points.length - 2] : null,
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

    draggingClass () {
      return this.beingDragged ? 'dragging' : '';
    },

    dragPathAsSvg () {
      if (this.dragPath.start.x === null) return '';
      const buffer = 3;
      const { start, end } = this.dragPath;
      let path = `M${start.x} ${start.y}`;

      if (end) {
        // give some buffer to the mouse cursor
        path += ` L${end.x > start.x ? end.x - buffer : end.x + buffer} ${end.y > start.y ? end.y - buffer : end.y + buffer}`;
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

    isPortCandidate (port) {
      return find(this.portDropCandidates, { nodeId: port.nodeId, portId: port.portId }) !== undefined;
    },

    isNodeCandidateId (id) {
      const result = find(this.nodeDropCandidates, { id }) !== undefined;
      return result;
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
      this.beingDragged = { type: 'port', data: { ...port } };
      this.nodeDropCandidates = this.nodes.filter(n => {
        return n[`canCreate${port.type === 'target' ? 'Output' : 'Input'}Ports`] &&
          n.id !== port.nodeId;
      });
      this.portDropCandidates = this.ports.filter(p => p.type !== port.type && p.nodeId !== port.nodeId);
      if (this.filterDropCandidates) {
        this.portDropCandidates = this.portDropCandidates.filter(p => {
          return this.filterDropCandidates(this.beingDragged, p);
        });
      }
      this.dragPath = {
        start: {...port.point}
      };
    },

    handleNodeDragStart (node) {
      this.beingDragged = { type: 'node', data: { ...node } };
      if (!node.canCreateOutputPorts) return;
      this.nodeDropCandidates = this.nodes.filter(n => {
        return n.canCreateInputPorts &&
          n.id !== node.id;
      });
      this.portDropCandidates = this.ports.filter(p => p.type === 'target' && p.nodeId !== node.id);
      if (this.filterDropCandidates) {
        this.portDropCandidates = this.portDropCandidates.filter(p => {
          return this.filterDropCandidates(this.beingDragged, p);
        });
      }
      this.dragPath = {
        start: { x: node.x + this.graphOptions.nodeWidth / 2, y: node.y + this.graphOptions.nodeHeight / 2 }
      };
    },
    handleDrag (evt) {
      this.dragPath = {
        ...this.dragPath,
        end: { x: evt.x, y: evt.y }
      };
    },

    handleDragEnd () {
      this.portDropCandidates = [];
      this.nodeDropCandidates = [];
      this.dragPath = emptyDragPath();
      // clear on next tick to allow custom drop event to access source port
      this.$nextTick(() => {
        this.beingDragged = null;
      });
    },

    handleDropTarget (target) {
      // here is where we tell the consumer what port was dropped onto another port
      const connection = {
        from: { ...this.beingDragged },
        to: { ...target }
      };
      this.onConnection(connection);
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
