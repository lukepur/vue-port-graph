import { cloneDeep, assign } from 'lodash';
import toposort from 'toposort';

const matchPort = (source, target) => {
  return source.nodeId === target.nodeId && source.portId === target.portId;
};

export const applyNewPortConnection = (graph, connection) => {
  const result = cloneDeep(graph);
  const { edges } = result;

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
