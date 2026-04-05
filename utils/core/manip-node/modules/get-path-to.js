import { typeOf } from "../../type-of.js";

import { BaseParser } from "../../../../classes/modules/base/base-parser.js";
const base_parser = new BaseParser();
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Traverses the collections of nodes & edges to return the path from the root node to a given target node.
 * @param {Object} tree_coll - The collection of nodes & edges.
 * @param {Object} target_node - The target node for which the path is to be found.
 * @returns {string[]} An array of segments of the path from the root node to the target node in dot notation.
 * @console {Warning} If the target node is not found in the nodes collection.
 */
export function getPathToNode(tree_coll, target_node) {
  param_validator.validateKeyedObj(tree_coll);
  param_validator.validateKeyedObj(target_node);

  const { nodes, edges } = tree_coll;
  param_validator.validateJsonArr(nodes);
  param_validator.validateArray(edges);
  param_validator.warnJsonArrOfEmptyObjects(nodes);

  const id_key = base_parser.node_id_key;
  const node_map = new Map(nodes.map((node) => [node[id_key], node]));
  const edge_map = new Map(edges.map((edge) => [edge.to, edge.from]));
  if (
    Object.prototype.hasOwnProperty.call(tree_coll, "nodes") === false ||
    Object.prototype.hasOwnProperty.call(tree_coll, "edges") === false ||
    !Array.isArray(tree_coll.nodes) ||
    !Array.isArray(tree_coll.edges)
  ) {
    throw new TypeError(
      `${getPathToNodeBy.name} - Invalid input. Expected:
          - ${
            arguments[0]
          } to have 'nodes' and 'edges' properties with array values. Instead, was passed ${JSON.stringify(
            arguments[0],
          )}
          - ${
            arguments[1]
          } to have 'nodes' and 'edges' properties with array values. Instead, was passed ${typeOf(
            arguments[1],
          )}`,
    );
  }

  const target_node_id = target_node[id_key];

  if (!node_map.has(target_node_id)) {
    console.warn(
      `${getPathToNode.name} - Target node identified by ${id_key} with ID ${target_node_id} not found in nodes collection`,
    );
  }

  let curr_node_id = target_node_id;
  const path_segments = [curr_node_id];

  while (edge_map.has(curr_node_id)) {
    curr_node_id = edge_map.get(curr_node_id);
    path_segments.unshift(curr_node_id);
  }

  return path_segments;
}

/**
 * @description Finds the path from the root node to a specified target node within a tree collection.
 * @param {Object} tree_coll - The collection of nodes and edges representing the tree structure.
 * @param {Object} target_node - The target node for which the path needs to be found.
 * @param {string} seg_key - The key used to identify the segments of the path.
 * @param {string} [id_key=base_parser.node_id_key] - The key used to identify nodes uniquely.
 * @returns {Array} An array containing the segments of the path from the root node to the target node.
 * @console {Warning} If the target node is not found in the nodes collection.
 */
export function getPathToNodeBy(
  tree_coll,
  target_node,
  seg_key,
  id_key = base_parser.node_id_key,
) {
  param_validator.validateKeyedObj(tree_coll);
  param_validator.validateKeyedObj(target_node);
  param_validator.validateString(seg_key);
  param_validator.validateString(id_key);

  if (
    Object.prototype.hasOwnProperty.call(tree_coll, "nodes") === false ||
    Object.prototype.hasOwnProperty.call(tree_coll, "edges") === false ||
    !Array.isArray(tree_coll.nodes) ||
    !Array.isArray(tree_coll.edges)
  ) {
    throw new TypeError(
      `${getPathToNodeBy.name} - Invalid input. Expected:
          - ${
            arguments[0]
          } to have 'nodes' and 'edges' properties with array values. Instead, was passed ${JSON.stringify(
            arguments[0],
          )}
          - ${
            arguments[1]
          } to have 'nodes' and 'edges' properties with array values. Instead, was passed ${typeOf(
            arguments[1],
          )}`,
    );
  }

  const { nodes, edges } = tree_coll;
  param_validator.validateJsonArr(nodes);
  param_validator.validateArray(edges);
  param_validator.warnJsonArrOfEmptyObjects(nodes);

  const node_map = new Map(nodes.map((node) => [node[id_key], node]));
  const edge_map = new Map(edges.map((edge) => [edge.to, edge.from]));

  const target_node_id = target_node[id_key];

  if (!node_map.has(target_node_id)) {
    console.warn(
      `${getPathToNodeBy.name} - Target node identified by ${id_key} with ID ${target_node_id} not found in nodes collection`,
    );
    return undefined;
  }

  let curr_node_id = target_node_id;
  const path_segments = [node_map.get(curr_node_id)[seg_key]];

  while (edge_map.has(curr_node_id)) {
    curr_node_id = edge_map.get(curr_node_id);
    path_segments.unshift(node_map.get(curr_node_id)[seg_key]);
  }

  return path_segments;
}
