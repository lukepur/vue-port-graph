<template>
<div>
  <h1>Home</h1>
  <PortGraph :graphConfig="graphConfig" />
</div>
</template>

<script>
import PortGraph from '../components/port-graph.vue';

export default {
  name: 'home',
  data () {
    return {
      graphConfig: {
        nodes: [
          { id: 'input_node', ports: [ { id: 'input_one', type: 'output' }, { id: 'input_two', type: 'output' } ] },
          { id: 'subprocess_one', ports: [ { id: 'arg_one', type: 'input' }, { id: 'arg_two', type: 'input' }, { id: 'output', type: 'output' } ] },
          { id: 'subprocess_two', ports: [ { id: 'arg_one', type: 'input' }, { id: 'output', type: 'output' } ] }
        ],
        edges: [
          { source: { nodeId: 'input_node', portId: 'input_one' }, target: { nodeId: 'subprocess_one', portId: 'arg_one' } },
          { source: { nodeId: 'input_node', portId: 'input_two' }, target: { nodeId: 'subprocess_two', portId: 'arg_one' } },
          { source: { nodeId: 'subprocess_two', portId: 'output' }, target: { nodeId: 'subprocess_one', portId: 'arg_two' } }
        ]
      }
    };
  },
  components: {
    PortGraph
  }
}
</script>
