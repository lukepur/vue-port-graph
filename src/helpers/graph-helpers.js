import { find, cloneDeep, assign } from 'lodash';
import dagre from 'dagre';

const matchPort = (source, target) => {
  return source.nodeId === target.nodeId && source.portId === target.portId;
};

export const applyNewPortConnection = (graph, connection) => {
  const result = cloneDeep(graph);
  const { nodes, edges } = result;

  // remove replaced edges
  let newEdges = edges.filter(e => 
    !matchPort(e.source, connection.from) &&
    !matchPort(e.source, connection.to) &&
    !matchPort(e.target, connection.from) &&
    !matchPort(e.target, connection.to));

  // add new edge
  newEdges = [
    ...newEdges,
    {
      source: { nodeId: connection.from.nodeId, portId: connection.from.portId },
      target: { nodeId: connection.to.nodeId, portId: connection.to.portId }
    }
  ];

  return assign({}, result, {
    edges: newEdges
  });
};

export const isGraphAcyclic = graphConfig => {
  const graph = new dagre.graphlib.Graph();
  const { nodes, edges } = graphConfig;
  graph.setGraph({});
  graph.setDefaultEdgeLabel(() => ({}));
  nodes.forEach(n => {
    graph.setNode(n.id);
  });
  edges.forEach(e => {
    graph.setEdge(e.source.nodeId, e.target.nodeId);
  });

  const result = dagre.layout(graph);

  console.log('isDirected:',graph.isDirected());

  return graph;
};
