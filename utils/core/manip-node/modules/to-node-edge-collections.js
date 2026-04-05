import { isEmptyObj } from "../../check/index.js";
import { typeOf } from "../../type-of.js";
import { extractFromObjBy } from "../../manip-obj/modules/extract-from-obj-by.js";

import { BaseParser } from "../../../../classes/modules/base/base-parser.js";
const base_parser = new BaseParser();
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Converts a tree structure into node & edge collections.
 * @param {Object} tree - The node tree object.
 * @param {string} child_entries_key - The property name for the child nodes.
 * @returns {Object} - An object containing the node & edge collections.
 * @example
 * const tree = {
 *   id: 'root-id',
 *   children: [
 *     {
 *       id: 'child-id-1',
 *       children: [
 *         {
 *           id: 'grandchild-id',
 *           children: [],
 *         },
 *       ],
 *     },
 *     {
 *       id: 'child-id-2',
 *       children: [],
 *     },
 *   ],
 * };
 * const { nodes, edges } = toNodeEdgeCollections(tree, 'children');
 *
 * // Expected output:
 * // Nodes: [
 * //   { id: 'root-id', children: [ [Object], [Object] ] },
 * //   { id: 'child-id-1', children: [ [Object] ] },
 * //   { id: 'grandchild-id', children: [] },
 * //   { id: 'child-id-2', children: [] }
 * // ]
 * // Edges: [
 * //   { from: 'root-id', to: 'child-id-1' },
 * //   { from: 'root-id', to: 'child-id-2' },
 * //   { from: 'child-id-1', to: 'grandchild-id' }
 * // ]
 */
export function toNodeEdgeColBFTinAOFwID(
  node_tree,
  child_entries_key = base_parser.child_entries_key,
  node_id_key = base_parser.node_id_key,
) {
  param_validator.validateKeyedObj(node_tree);
  param_validator.validateStringIsNotEmpty(child_entries_key);
  param_validator.validateStringIsNotEmpty(node_id_key);
  if (!(node_id_key in node_tree)) {
    throw new ReferenceError(
      `${
        toNodeEdgeColBFTinAOFwID.name
      } - Invalid input. Expected the keyed Object ${node_tree} to have the key ${node_id_key}. Instead, was passed ${typeOf(
        node_tree,
      )}`,
    );
  }

  if (isEmptyObj(node_tree)) {
    console.warn(`${toNodeEdgeColBFTinAOFwID.name} - The node tree is empty.`);
    return { nodes: [], edges: [] };
  }

  const nodes = [];
  const edges = [];
  const queue = [{ node: node_tree, parent_id: null }];

  while (queue.length > 0) {
    const { node, parent_id } = queue.shift();
    nodes.push({
      id: node[node_id_key],
      ...node,
    });
    if (parent_id) {
      edges.push({
        from: parent_id,
        to: node[node_id_key],
      });
    }

    if (node[child_entries_key] && node[child_entries_key].length > 0) {
      node[child_entries_key].forEach((child) =>
        queue.push({ node: child, parent_id: node[node_id_key] }),
      );
    }
  }
  return { nodes, edges };
}

/**
 * @description Converts a node tree into nodes & edges collections using Breadth-First Traversal (BFT).
 * @param {Object} root_node - The node tree to convert.
 * @param {string} [child_entries_key="child_entries"] - The key to access the child nodes in the tree.
 * @returns {Object} An object containing nodes and edges collections.
 */
export function toNodeEdgeColBFTinAOFnoID(
  root_node,
  child_entries_key = base_parser.child_entries_key,
) {
  param_validator.validateKeyedObj(root_node);
  param_validator.validateStringIsNotEmpty(child_entries_key);

  if (isEmptyObj(root_node)) {
    console.warn(`${toNodeEdgeColBFTinAOFnoID.name} - The node tree is empty.`);
    return { nodes: [], edges: [] };
  }

  const nodes = [];
  const edges = [];
  const queue = [root_node];

  while (queue.length > 0) {
    const curr_node = queue.shift();
    const node_id = nodes.length;
    /* to avoid data duplication and reduce memory usage, exclude the `child_entries_key` property
      now that the representation of the hierarchy is being shifted to the edges */
    const all_props_except_child_subtree = extractFromObjBy(
      curr_node,
      [child_entries_key],
      true,
    );
    nodes.push({
      ...{ id: node_id },
      ...all_props_except_child_subtree,
    });

    if (
      curr_node[child_entries_key] &&
      Array.isArray(curr_node[child_entries_key])
    ) {
      curr_node[child_entries_key].forEach((child) => {
        let child_id = node_id + queue.length + 1; // ID increments from parent ID, +1 for each child node
        edges.push({ from: node_id, to: child_id });
        queue.push(child);
      });
    }
  }
  return { nodes, edges };
}

/**
 * @description Converts a cascading node tree into nodes & edges collections using Breadth-First Traversal (BFT).
 * @requires every child node to be a keyed Object.
 * @param {Object} root_node - The node tree to convert.
 * @returns {Object} An object containing nodes and edges collections.
 */
export function toNodeEdgeColBFTinAOFnoIDcascading(root_node) {
  param_validator.validateKeyedObj(root_node);

  if (isEmptyObj(root_node)) {
    console.warn(
      `${toNodeEdgeColBFTinAOFnoIDcascading.name} - The node tree is empty.`,
    );
    return { nodes: [], edges: [] };
  }

  const nodes = [];
  const edges = [];
  const queue = [root_node];

  while (queue.length > 0) {
    const curr_node = queue.shift();
    const node_id = nodes.length;
    const children = Object.values(curr_node);

    // Exclude child nodes from the current node properties
    const all_props_except_child_subtree = Object.fromEntries(
      Object.entries(curr_node).filter(
        ([key, value]) => typeOf(value) !== "Object",
      ),
    );
    nodes.push({
      ...{ id: node_id },
      ...all_props_except_child_subtree,
    });

    children.forEach((child) => {
      if (child && typeOf(child) === "Object") {
        let child_id = node_id + queue.length + 1; // ID increments from parent ID, +1 for each child node
        edges.push({ from: node_id, to: child_id });
        queue.push(child);
      }
    });
  }
  return { nodes, edges };
}

/**
 * @description Converts a hierarchical tree structure into node & edge collections using Breadth-First Traversal (BFT).
 * Each node is assigned a default ID based on its position in the traversal order. The function assumes
 * that all nodes in the tree do not have an ID property. The parent node's key is retained in the property `key_name`.
 * @requires node tree to be a cascading node, where every child node is a keyed Object.
 * @param {Object} root_node - The node tree to convert.
 * @param {String} key_name - The name of the child node key.
 * @returns {Object} An object containing two arrays: `nodes` and `edges`.
 * - `nodes`: An array of node objects, each with an `id` and `key_name`.
 * - `edges`: An array of edge objects, each with `from` and `to` properties based on node IDs.
 */
export function toNodeEdgeColBFTinAOFnoIDcascadingBy(root_node, name_key) {
  param_validator.validateKeyedObj(root_node);
  param_validator.validateStringIsNotEmpty(name_key);

  if (isEmptyObj(root_node)) {
    console.warn(
      `${toNodeEdgeColBFTinAOFnoIDcascadingBy.name} - The node tree is empty.`,
    );
    return { nodes: [], edges: [] };
  }

  const nodes = [];
  const edges = [];
  const queue = [{ node: root_node, [name_key]: Object.keys(root_node)[0] }];

  while (queue.length > 0) {
    const { node: curr_node, [name_key]: curr_name } = queue.shift();
    const node_id = nodes.length;
    const all_props_except_child_subtree = {};
    const children = [];

    Object.entries(curr_node).forEach(([key, value]) => {
      if (typeOf(value) === "Object") {
        // child nodes are assumed to be keyed Objects
        children.push([key, value]);
      } else {
        // exclude child nodes from the current node properties
        all_props_except_child_subtree[key] = value;
      }
    });

    nodes.push({
      id: node_id,
      [name_key]: curr_name,
      ...all_props_except_child_subtree,
    });

    children.forEach(([child_key, child_value]) => {
      let child_id = node_id + queue.length + 1; // ID increments from parent ID, +1 for each child node
      edges.push({ from: node_id, to: child_id });
      queue.push({ node: child_value, [name_key]: child_key });
    });
  }
  return { nodes, edges };
}

// TODO - create another version for, "Keyed Object Format" (KOF) - where the nodes are keyed by their id:
// nodeTree = {
//     id: 0,
//     name: "example",
//     child_entries: [
//       {
//         id: 1,
//         name: "is_digitalAgency",
//         child_entries: []
//       },
//       {
//         id: 2,
//         name: "is_execSearchFirm",
//         child_entries: []
//       }
//     ]
//   };

/**
 * @description Depth-First Traversal of a tree structure to output collections of nodes and edges.
 * @requires child node to be a keyed Object.
 * @param {Object} root_node - The root node of the tree to traverse.
 * @returns {Object} An object containing two arrays: nodes and edges.
 * @throws {TypeError} If the root_node is not a keyed Object.
 * @example
 * const tree = {
 *   tags: {
 *     inherent: {
 *       company_description: {
 *         martech: ["test0"],
 *       },
 *       inferred: {
 *         skillset: {
 *           middle_management: ["test1"],
 *         },
 *       },
 *     },
 *   },
 * };
 *
 * const output = toNodeEdgeColDFTinAOFnoID(tree);
 * console.log(output);
 * // Output: {
 * //   nodes: [
 * //     { id: 'tags', data: { inherent: { company_description: { martech: ["test0"] }, inferred: { skillset: { middle_management: ["test1"] } } } } },
 * //     { id: 'inherent', data: { company_description: { martech: ["test0"] }, inferred: { skillset: { middle_management: ["test1"] } } } },
 * //     { id: 'company_description', data: { martech: ["test0"] } },
 * //     { id: 'martech', data: ["test0"] },
 * //     { id: 'inferred', data: { skillset: { middle_management: ["test1"] } } },
 * //     { id: 'skillset', data: { middle_management: ["test1"] } },
 * //     { id: 'middle_management', data: ["test1"] }
 * //   ],
 * //   edges: [
 * //     { from: 'tags', to: 'inherent' },
 * //     { from: 'inherent', to: 'company_description' },
 * //     { from: 'company_description', to: 'martech' },
 * //     { from: 'inherent', to: 'inferred' },
 * //     { from: 'inferred', to: 'skillset' },
 * //     { from: 'skillset', to: 'middle_management' }
 * //   ]
 * // }
 */

// function toNodeEdgeColDFTinAOFnoID(root_node) {
//   if (typeOf(root_node) !== "Object") {
//     throw new TypeError(
//       `${toNodeEdgeColDFTinAOFnoID.name} - Invalid input. Expected ${
//         arguments[0]
//       } to be a keyed Object. Instead, was passed ${typeOf(arguments[0])}`,
//     );
//   }

//   const nodes = [];
//   const edges = [];
//   const stack = [{ node: root_node, parentId: null }];

//   while (stack.length > 0) {
//     const { node, parentId } = stack.pop();
//     const nodeId = Object.keys(node)[0] || "";
//     nodes.push({ id: nodeId, data: node[nodeId] });

//     if (parentId !== null) {
//       edges.push({ from: parentId, to: nodeId });
//     }

//     const children = Object.entries(node[nodeId]);
//     children.forEach(([key, child]) => {
//       if (child && typeOf(child) === "Object") {
//         stack.push({ node: { [key]: child }, parentId: nodeId });
//       }
//     });
//   }

//   return { nodes, edges };
// }
