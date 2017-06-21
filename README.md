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

## Props

### `graphConfig` (object)

The configuration of the graph to render. Has the following shape:

```
{
  nodes: [
    { id: 'node_id', canCreateOutputPorts: true, ports: [ { id: 'input_one', type: 'input' }, { id: 'output_one', type: 'output' } ] }
    { id: 'node_2_id', canCreateInputPorts: true, ports: [ { id: 'input_one', type: 'input' }, { id: 'output_one', type: 'output' } ] }
  ],
  edges: [
    { source: { nodeId: 'input_id', portId: 'output_one' }, target: { nodeId: 'node_2_id', portId: 'input_one' } },
  ],
  options: {
    nodeWidth: 200,
    nodeHeight: 40,
    portRadius: 10,
    graphPadding: 20
  }
}
```

### `onConnection` (function)

The callback invoked when one node or port is dropped onto another node or port.

The callback receives a `connection` object as the only parameter. `connection` has the following shape:

```
{
  from: { type: 'node|port', data: { nodeId, portId, type ('source' | 'target'), point { x, y } } },
  to: { type: 'node|port', data: { nodeId, portId, type ('source' | 'target'), point { x, y } } }
}
```

This callback is only invoked if the dragged node or port can legally be connected to the dropped node or port (they are of opposite types, different nodes, and aren't excluded by the `filterDropCandidates` filter).

### `filterDropCandidates` (function)

An optional filter to apply to the droppable ports when a port drag is started.

This callback receives 2 args: `portBeingDragged` and `candidatePort` and should return true to include the `candidatePort` as a legal drop target.

## Example

Demo: [https://lukepur.github.io/vue-port-graph](https://lukepur.github.io/vue-port-graph)