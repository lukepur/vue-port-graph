<template>
  <div class="">
    <svg :width="layout.graph().width + (2 * padding)" :height="layout.graph().height + (2 * padding)">
      <g :transform="`translate(${padding}, ${padding})`">
        <Node v-for="(node, index) in nodes" :node="node" :key="index" />
        <Edge v-for="(edge, index) in edges" :edge="edge" :key="index" />
        <Port v-for="(port, index) in ports" :port="port" :radius="portRadius" :key="index" />
      </g>
    </svg>
  </div>
</template>

<script>
import dagre from 'dagre';
import { find, last } from 'lodash';

import Node from './node.vue';
import Edge from './edge.vue';
import Port from './port.vue';

const DUMMY_PREFIX = 'dummy_';

export default {
  name: 'PortGraph',
  props: {
    graphConfig: {
      type: Object,
      default: () => ({ nodes: [], edges: [], options: {} })
    }
  },
  computed: {
    layout () {
      const { nodes, edges, options } = this.graphConfig;

      // init dagre graph
      const graph = new dagre.graphlib.Graph();
      graph.setGraph({});
      graph.setDefaultEdgeLabel(() => ({}));

      let dummySeq = 0;

      // add dagre nodes
      nodes.forEach(node => {
        graph.setNode(node.id, { label: node.id, width: options.nodeWidth, height: options.nodeHeight });

        // add dummy nodes for unconnected ports
        node.ports.forEach(port => {
          if (!this.isPortConnected(port, node.id, edges)) {
            const dummyId = `${DUMMY_PREFIX}${dummySeq++}`;
            graph.setNode(dummyId, { width: options.nodeWidth / 2, height: 0 });
            graph.setEdge(node.id, dummyId);
          }
        });
      });

      // add dagre edges
      edges.forEach(edge => {
        graph.setEdge(edge.source.nodeId, edge.target.nodeId);
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
        const { v, w } = edge;
        if (!this.isDummyLabel(v)) {
          ports.push({
            point: this.layout.edge(edge).points[0],
            type: 'source'
          });
        }
        if (!this.isDummyLabel(w)) {
          ports.push({
            point: last(this.layout.edge(edge).points),
            type: 'target'
          });
        }
      });
      return ports;
    },

    padding () {
      const { graphPadding } = this.graphConfig.options;
      return graphPadding !== undefined ? graphPadding : 20;
    },

    portRadius () {
      let { portRadius } = this.graphConfig.options;
      if (portRadius === undefined) portRadius = 5;
      return portRadius;
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
    nodeX (n) {
      const { x } = this.layout.node(n);
      return x - (this.layout.node(n).width / 2);
    },
    nodeY (n) {
      const { y } = this.layout.node(n);
      return y - (this.layout.node(n).height / 2);
    }
  },
  components: {
    Node,
    Edge,
    Port
  }
}
</script>

<style scoped>
</style>
