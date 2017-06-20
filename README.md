# vue-port-graph

Graph a layout of nodes with ports. Supports drag and drop event handling for ports.
<p align="center">
  <img src="docs/static/graph.png?raw=true" alt="Port graph example" title="Port graph example"/>
</p>

## Installation

`npm install vue-port-graph`

## Usage

```
<template>
  <PortGraph :graphConfig="config" :onPortConnection="handleConnection" />
</template>

<script>
import PortGraph from 'vue-port-graph';

export default {
  name: 'app',
  data () {
    return {
      config: {
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
    handleConnection (connection) {
      // update config as necessary if connection is valid
    }
  },
  components: {
    PortGraph
  }
}
</script>

```

## Example

Demo: [https://lukepur.github.io/vue-port-graph](https://lukepur.github.io/vue-port-graph)