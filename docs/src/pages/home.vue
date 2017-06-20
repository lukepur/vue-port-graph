<template>
<div>
  <h1>vue-port-graph</h1>
  <h3>Graph</h3>
  <PortGraph :graphConfig="graphConfig" :onConnection="handleConnection" :filterDropCandidates="filterDropCandidates"/>
  <h3>Config</h3>
  <pre>{{ JSON.stringify(graphConfig, null, 2).trim() }}</pre>
</div>
</template>

<script>
import PortGraph from 'vue-port-graph';
import { applyNewConnection, isGraphAcyclic } from '../helpers/graph-helpers';

export default {
  name: 'home',
  data () {
    return {
      graphConfig: {
        nodes: [
          { id: 'input_node', canCreateOutputPorts: true, ports: [ { id: 'input_one', type: 'output' }, { id: 'input_two', type: 'output' }, { id: 'input_three', type: 'output' } ] },
          { id: 'subprocess_one', ports: [ { id: 'arg_one', type: 'input' }, { id: 'arg_two', type: 'input' }, { id: 'output', type: 'output' } ] },
          { id: 'subprocess_two', ports: [ { id: 'arg_one', type: 'input' }, { id: 'arg_two', type: 'input' }, { id: 'output', type: 'output' } ] },
          { id: 'sink', canCreateInputPorts: true, ports: [ { id: 'arg_one', type: 'input' }, { id: 'arg_two', type: 'input' }, { id: 'output', type: 'output' } ] }
        ],
        edges: [
          { source: { nodeId: 'input_node', portId: 'input_one' }, target: { nodeId: 'subprocess_one', portId: 'arg_one' } },
          { source: { nodeId: 'input_node', portId: 'input_two' }, target: { nodeId: 'subprocess_two', portId: 'arg_one' } },
          { source: { nodeId: 'subprocess_two', portId: 'output' }, target: { nodeId: 'subprocess_one', portId: 'arg_two' } }
        ],
        options: {
          nodeWidth: 200,
          nodeHeight: 40,
          portRadius: 10,
          graphPadding: 20
        }
      }
    };
  },
  methods: {
    handleConnection (con) {
      console.log(JSON.stringify(con));
      const result = applyNewConnection(this.graphConfig, con);
      if (isGraphAcyclic(result)) this.graphConfig = result;
    },
    filterDropCandidates (portBeingDragged, candidate) {
      // return Math.random() > 0.5;
      return true;
    }
  },
  components: {
    PortGraph
  }
}
</script>

<style scoped>
pre {
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
  padding: 2em;
  border: 1px solid #d3d3d3;
  border-radius: 5px;
  background-color: #f1f1f1;
}
</style>
