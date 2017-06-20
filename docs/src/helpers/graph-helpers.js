import { cloneDeep, assign, find } from 'lodash';
import toposort from 'toposort';

const matchPort = (source, target) => {
  return source.nodeId === target.nodeId && source.portId === target.portId;
};

export const applyNewConnection = (graph, connection) => {
  // Port to port
  if (connection.from.type === 'port' && connection.to.type === 'port') {
    return applyNewPortToPortConnection(graph, connection);
  }

  // Node to node
  if (connection.from.type === 'node' && connection.to.type === 'node') {
    return applyNewNodeToNodeConnection(graph, connection);
  }

  // Port to node
  if (connection.from.type === 'port' && connection.to.type === 'node') {
    return applyNewPortToNodeConnection(graph, connection);
  }

  // Node to port
  if (connection.from.type === 'node' && connection.to.type === 'port') {
    return applyNewNodeToPortConnection(graph, connection);
  }
};

const applyNewPortToPortConnection = (graph, connection) => {
  const result = cloneDeep(graph);
  const { edges } = result;

  // remove replaced edges
  let newEdges = edges.filter(e =>
    !matchPort(e.source, connection.from.data) &&
    !matchPort(e.source, connection.to.data) &&
    !matchPort(e.target, connection.from.data) &&
    !matchPort(e.target, connection.to.data));

  // add new edge
  newEdges = [
    ...newEdges,
    {
      source: { nodeId: connection.from.data.nodeId, portId: connection.from.data.portId },
      target: { nodeId: connection.to.data.nodeId, portId: connection.to.data.portId }
    }
  ];

  return assign({}, result, {
    edges: newEdges
  });
};

const applyNewNodeToNodeConnection = (graph, connection) => {
  // add an output port to from node and an input port to to node and add edge from created ports
  const result = cloneDeep(graph);
  const { nodes, edges } = result;
  const fromNode = find(nodes, { id: connection.from.data.id });
  const fromPortId = `output_${fromNode.ports.filter(p => p.type === 'output').length + 1}`;
  fromNode.ports = [
    ...fromNode.ports,
    {
      id: fromPortId,
      type: 'output'
    }
  ];
  const toNode = find(nodes, { id: connection.to.data.id });
  const toPortId = `input_${toNode.ports.filter(p => p.type === 'input').length + 1}`;
  toNode.ports = [
    ...toNode.ports,
    {
      id: toPortId,
      type: 'input'
    }
  ];
  return {
    ...result,
    nodes,
    edges: [
      ...edges,
      {
        source: { nodeId: fromNode.id, portId: fromPortId },
        target: { nodeId: toNode.id, portId: toPortId }
      }
    ]
  };
};

const applyNewNodeToPortConnection = (graph, connection) => {
  // add an output port to from node and apply new port connection
  const result = cloneDeep(graph);
  const { nodes } = result;
  const fromNode = find(nodes, { id: connection.from.data.id });
  const fromPortId = `output_${fromNode.ports.filter(p => p.type === 'output').length + 1}`;
  fromNode.ports = [
    ...fromNode.ports,
    {
      id: fromPortId,
      type: 'output'
    }
  ];
  const portConnection = {
    from: {
      type: 'port',
      data: { nodeId: fromNode.id, portId: fromPortId }
    },
    to: connection.to
  };
  return applyNewPortToPortConnection(result, portConnection);
};

const applyNewPortToNodeConnection = (graph, connection) => {
  // add an input port to to node and apply new port connection
  const result = cloneDeep(graph);
  const { nodes } = result;
  const toNode = find(nodes, { id: connection.to.data.id });
  const toPortId = `output_${toNode.ports.filter(p => p.type === 'input').length + 1}`;
  toNode.ports = [
    ...toNode.ports,
    {
      id: toPortId,
      type: 'input'
    }
  ];
  const portConnection = {
    from: connection.from,
    to: {
      type: 'port',
      data: { nodeId: toNode.id, portId: toPortId }
    }
  };
  return applyNewPortToPortConnection(result, portConnection);
};

export const isGraphAcyclic = graphConfig => {
  const { edges } = graphConfig;
  const deps = edges.map(edge => [edge.source.nodeId, edge.target.nodeId]);
  let isAcyclic;
  try {
    toposort(deps);
    isAcyclic = true;
  } catch (e) {
    isAcyclic = false;
  }
  return isAcyclic;
};
