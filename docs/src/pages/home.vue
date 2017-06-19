<template>
<div>
  <h1>vue-port-graph</h1>
  <h3>Graph</h3>
  <PortGraph :graphConfig="graphConfig" :onPortConnection="handleConnection" />
  <h3>Config</h3>
  <pre>{{ JSON.stringify(graphConfig, null, 2).trim() }}</pre>
</div>
</template>

<script>
import PortGraph from 'vue-port-graph';
import { applyNewPortConnection } from '../../../src/helpers/graph-helpers';

export default {
  name: 'home',
  data () {
    return {
      graphConfig: {
        nodes: [
          { id: 'input_node', ports: [ { id: 'input_one', type: 'output' }, { id: 'input_two', type: 'output' }, { id: 'input_three', type: 'output' } ] },
          { id: 'subprocess_one', ports: [ { id: 'arg_one', type: 'input' }, { id: 'arg_two', type: 'input' }, { id: 'output', type: 'output' } ] },
          { id: 'subprocess_two', ports: [ { id: 'arg_one', type: 'input' }, { id: 'arg_two', type: 'input' }, { id: 'output', type: 'output' } ] }
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
      console.log('connection received:', con);
      console.log('this.graphConfig:', this.graphConfig);
      // this.graphConfig = applyNewPortConnection(this.graphConfig, con);
      const result = applyNewPortConnection(this.graphConfig, con);
      this.graphConfig = result;
      // return result;
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
