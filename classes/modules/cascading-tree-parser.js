import {
  typeOf,
  isEmptyObj,
  getLeafContainers,
  mergeTopLevelPropsByDepthOfNesting,
} from "../../utils/index.js";

// local imports
import { BaseParser } from "./base/base-parser.js";
import param_validator from "./param-validator.js";

/**
 * @classdesc A parser for handling cascading tree structures,
 * where each child node is a keyed Object only (no Array of keyed objects)
 *
 * @typedef {Object<string, CascadingNodeTree | {}} CascadingNodeTree
 * @property {CascadingNodeTree | {}} [key] - A cascading node tree where every child node is a keyed Object or an empty Object.
 * In a cascading node tree, child nodes only have one parent, and can only be Objects.
 * A leaf node is the the terminal node at the tail end of a branch that doesn't have a child node. Hence, either:
 * - an empty Object
 * - a keyed Object with a primitive value, or an Array of primitive values
 * - (exception to be culled) an Array of keyed Objects with a primitive value, or an Array of primitive values
 *
 * @method mergeCascading
 * @method getValAtNodeCascading
 * @method setNodeValueCascading
 * @method getLeafNodesCascadingDFT
 * @method toNodeEdgeColBFTinAOFnoIDcascading
 * @method toNodeEdgeColBFTinAOFnoIDcascadingBy
 */
export class CascadingTreeParser extends BaseParser {
  constructor() {
    super();
    this.root_node = {};
    this.nodes = [];
    this.edges = [];
  }

  setStateTo = (root_node) => {
    param_validator.validateKeyedObj(root_node);
    this.root_node = root_node;
    // reset attributes
    this.nodes = [];
    this.edges = [];
  };

  // get child_entries_key() {
  //   return this.child_entries_key;
  // }

  // get node_name_key() {
  //   return this.node_name_key;
  // }

  // get node_id_key() {
  //   return this.node_id_key;
  // }

  /**
   * @description From the root node, cascading traversal (child node are keyed objects) of a tree
   * to retrieve the property value at the tail end of the absolute path.
   * The path segments are stored in order in `abs_path_segments`.
   *
   * @requires branch of the node tree to be a cascading node, where every child node is a keyed Object.
   *
   * @param {Array<string>} abs_path_segments - Segments that compose the absolute path, from the root node to the target nested value.
   * @returns {*} - The value at the tail end of the path, or `undefined` if not found.
   *
   */
  getValAtNodeCascading = (abs_path_segments, node = this.root_node) => {
    param_validator.validateArrayOfStrings(abs_path_segments);

    abs_path_segments = abs_path_segments.filter(Boolean);
    if (!abs_path_segments.length) return node;
    return abs_path_segments.reduce(
      (acc, seg) => acc && acc[seg],
      node,
    ); /* Short-Circuiting:
    The && operator ensures that if `acc` is ever falsy, the entire expression evaluates to `undefined` for subsequent iterations.
    This means that if any segment in the path does not exist, the function will return `undefined` */
  };

  /**
   * @description From root node, construct / traverse cascading child nodes based on an array of path segments,
   * until it reaches the node at the tail end of the path,
   * to add a property whose:
   * - key is the last segment in `abs_path_segments`
   * - value is `value`.
   *
   * @param {Array<string>} abs_path_segments - An array of path segments,
   * comprised of the keys of nested properties, ordered by successive degrees of nesting,
   * which represents the absolute path to the target property.
   * @param {*} value - The value to set at the specified path.
   * @param {NodeTree} [NodeTree=this.root_node] - The starting node for the traversal. Defaults to the root node.
   * @returns {NodeTree} - The mutated in-place root node with the new nested properties. !! keep it (cf. addMetaTo) !!
   *
   */
  setNodeValueCascading = (abs_path_segments, value, node = this.root_node) => {
    param_validator.validateArrayOfStrings(abs_path_segments);
    param_validator.validateUndefined(value);
    param_validator.validateKeyedObj(node);

    abs_path_segments = abs_path_segments.filter(Boolean);
    if (!abs_path_segments.length) {
      return node;
    }

    const [key, ...rest] = abs_path_segments;
    node[key] ??= {}; // nullish coalescing assignment
    if (rest.length > 0) {
      this.setNodeValueCascading(rest, value, node[key]);
    } else {
      // set value at the tail end of the path
      node[key] = value;
    }
    // base case
    return node;
  };

  /**
   * @description Depth-First Traversal of a tree structure to get all leaf nodes.
   * A leaf node is defined as a keyed Object with no nested keyed Objects,
   * i.e. either an empty object or an object with non-object properties.
   *
   * @param {Object} root_node - The root node of the tree to traverse.
   * @returns {Object[]} An array of leaf nodes.
   *
   */
  getLeafNodesCascadingDFT = () => {
    const stack = [this.root_node];
    const leaf_nodes = [];

    while (stack.length > 0) {
      const node = stack.pop();

      const children = Object.values(node).filter(
        (child) => typeOf(child) === "Object",
      );
      if (!children.length) {
        // base case: property value is an empty keyed Object
        leaf_nodes.unshift(node);
      }

      children.forEach((child) => {
        if (child && typeOf(child) === "Object") {
          stack.push(child);
        } else {
          // base case: property value is of every other data type than keyed Object
          leaf_nodes.unshift(node);
        }
      });
    }
    return leaf_nodes;
  };

  /* Not tested. wrote it for a specific case */
  getLeafNodeIsObjCascading(node_tree = this.root_node) {
    if (typeOf(node_tree) !== "Object") {
      throw new TypeError(
        `${this.constructor.name} - Invalid input. Expected:
          - ${node_tree} to be a keyed Object. Instead, was passed ${typeOf(
            node_tree,
          )}`,
      );
    }
    if (isEmptyObj(node_tree)) {
      return [node_tree];
    }

    // for every key of mask, check if there's a degree of nesting (ie. `mask_val` is an Array or keyed Object)
    const nested_objs = Object.fromEntries(
      Object.entries(node_tree).filter(([key, val]) => typeof val === "object"),
    );

    if (!isEmptyObj(nested_objs)) {
      // if nesting, recurse on `node_tree[key]`
      return Object.entries(nested_objs).reduce((acc, [key, val]) => {
        // `val` is an Array was checked above, need to further check if Array of keyed Objects
        if (Array.isArray(val) && isJsonArray(val)) {
          // nesting level is an Array of keyed Objects
          val.forEach((n) => {
            // `acc` hoists the values of the leaf nodes
            acc = acc.concat(this.getLeafNodeIsObjCascading(n));
          });
        } else if (typeOf(val) === "Object") {
          // nesting level is a keyed object
          acc = acc.concat(this.getLeafNodeIsObjCascading(val));
        } else {
          // base case is reached: `val` is an Array of primitives or an Object; both can be empty.
          acc = deDupArr([...acc, node_tree]);
        }
        return acc;
      }, []);
    }
    // `val` is a primitive
    return [node_tree];
  }

  /**
   * @description Converts a hierarchical tree structure into node & edge collections.
   * Each node is assigned a default ID based on its position in the Breadth-First Traversal (BFT) order. The function assumes
   * that all nodes in the tree do not have an ID property.
   *
   * @param {Object} root_node - The node tree to convert. Implicitly supplied by the class instance `this.root_node`.
   *
   * @returns {Object} An object containing two arrays: `nodes` and `edges`.
   * - `nodes`: An array of node objects, each with an `[this.node_id_key]` and `key_name`.
   * - `edges`: An array of edge objects, each with `from` and `to` properties based on node IDs.
   */
  toNodeEdgeColBFTinAOFnoIDcascading = () => {
    const nodes = [];
    const edges = [];
    const queue = [this.root_node];

    while (queue.length > 0) {
      const curr_node = queue.shift();
      const node_id = nodes.length;

      // exclude child nodes from the current node properties
      const all_props_except_child_subtree = Object.fromEntries(
        Object.entries(curr_node).filter(
          ([key, value]) => typeOf(value) !== "Object",
        ),
      );
      nodes.push({
        ...{ [this.node_id_key]: node_id },
        ...all_props_except_child_subtree,
      });

      // child nodes are assumed to be keyed Objects
      const children = Object.values(curr_node).filter(
        (child) => typeOf(child) === "Object",
      );

      if (children.length > 0) {
        children.forEach((child) => {
          if (child && typeof child === "object") {
            let child_id = node_id + queue.length + 1; // ID increments from parent ID, +1 for each child node
            edges.push({ from: node_id, to: child_id });
            queue.push(child);
          }
        });
      }
    }
    return { nodes, edges };
  };

  /**
   * Combines the leaf nodes of `source` and `target` node trees, into `target`.
   * Merges the top-level properties of `source` that aren't cascading node trees, into `target`.
   *
   * @description first step is to merge the leaf nodes of `target` into `source` to output an array of containers.
   * Each container has the absolute path to the property. It traverses `target` to reach the end of the the absolute path
   * to get the respective property in `target`. Then combines the property from `source` and `target`.
   * Just because a leaf node was reached in `source` doesn't mean it's also a leaf node in `target`.
   * So, it merges by depth of nesting to ensure no property gets overwritten: higher depth of nesting supersedes.
   * Finally, it plants the combined metadata into `target`.
   *
   * @param {Object} target - The target node tree into which the combined metadata will be planted.
   * @param {Object} source - The source node tree whose metadata will be combined to the respective metadata in `target`.
   * @return {NodeTree} Mutates `target` in-place by reference.
   *
   * @requires CascadingTreeParser
   * @typedef {Object<string, CascadingNodeTree | {}} CascadingNodeTree
   * @property {CascadingNodeTree | {}} [key] - A cascading node tree where every child node is a keyed Object or an empty Object.
   * In a cascading node tree, child nodes only have one parent, and can only be Objects.
   * A leaf node is the the terminal node at the tail end of a branch that doesn't have a child node. Hence, either:
   * - an empty Object
   * - a keyed Object with a primitive value, or an Array of primitive values
   * - (exception to be culled) an Array of keyed Objects with a primitive value, or an Array of primitive values
   */
  mergeCascading = (source, target = this.root_node) => {
    param_validator.validateKeyedObj(source);

    if (isEmptyObj(target) || isEmptyObj(source)) {
      return Object.assign(target, source);
    }

    // Account for top-level properties of `source` that are not cascading node trees
    const source_clone = structuredClone(source);

    // Merge leaf nodes of `target` into `source` (higher depth of nesting supersedes)
    // const leaf_is_arr_containers = getLeafIsArrContainers(target, source);
    // const leaf_is_obj_containers = getLeafIsObjContainers(target, source);
    const leaf_is_obj_containers = getLeafContainers(target, source);

    // In `target`, assign combined meta to the node at the tail end of the path
    this.setStateTo(target);
    // in this order, as if a container is comprised of Array values,
    // it'd conflict with the objects in `leaf_is_obj_containers`, which it should override
    // [...leaf_is_obj_containers, ...leaf_is_arr_containers].forEach(
    leaf_is_obj_containers.forEach((container) => {
      const { abs_path_to_prop_segments, combined_prop } = container;
      // For the same path, properties should be merged, not overwritten
      let existing_obj =
        this.getValAtNodeCascading(abs_path_to_prop_segments) || {};

      /* leaf nodes in `source` were reached.
        However, at this depth, the respective `target` node might :
        - not be a leaf, in which case it should take precedence over incoming `combined_prop`,
        - have eventual top-level and nested properties that are not in `source` */
      let merged_prop =
        typeof existing_obj !== "object"
          ? combined_prop // overwrites existing with incoming
          : mergeTopLevelPropsByDepthOfNesting(existing_obj, combined_prop);
      this.setNodeValueCascading(abs_path_to_prop_segments, merged_prop);

      const top_lvl_key = abs_path_to_prop_segments.at(0);
      delete source_clone[top_lvl_key];
    });
    return Object.assign(target, source_clone);
  };

  /**
   * Converts a cascading tree structure into node & edge collections using Breadth-First Traversal (BFT).
   *
   * @requires node tree to be a cascading node, where every child node is a keyed Object.
   *
   * @description
   * This function takes a cascading tree structure and converts it into a collection of nodes and edges.
   * Each node is assigned a default ID based on its position in the traversal order. The function assumes
   * that all nodes in the tree do not have an ID property.
   * The parent node's key is retained in the property `name_key`.
   *
   * @param {String} name_key - The name of the child node key.
   *
   * @returns {Object} An object containing two arrays: `nodes` and `edges`.
   * - `nodes`: An array of node objects, each with an `[this.node_id_key]` and `name_key`.
   * - `edges`: An array of edge objects, each with `from` and `to` properties based on node IDs.
   */
  toNodeEdgeColBFTinAOFnoIDcascadingBy = () => {
    const name_key = this.node_name_key;
    const node_id_key = this.node_id_key;
    const child_entries_key = this.child_entries_key;
    const queue = [
      { node: this.root_node, [name_key]: Object.keys(this.root_node)[0] },
    ];

    while (queue.length > 0) {
      const { node: curr_node, [name_key]: curr_name } = queue.shift();
      const node_id = this.nodes.length;
      const all_props_except_child_subtree = {};
      const children = [];

      Object.entries(curr_node).forEach(([key, value]) => {
        if (typeOf(value) === "Object" && !isEmptyObj(value)) {
          // child nodes are assumed to be keyed Objects
          children.push([key, value]);
        } else {
          // exclude child nodes from the current node properties
          all_props_except_child_subtree[key] = value;
        }
      });

      // retain the child property name for recomposing the path from the root node to any (leaf) node
      this.nodes.push({
        [node_id_key]: node_id,
        [name_key]: curr_name,
        [child_entries_key]: [],
        ...all_props_except_child_subtree,
      });

      children.forEach(([child_key, child_value]) => {
        let child_id = node_id + queue.length + 1; // ID increments from parent ID, +1 for each child node
        this.edges.push({ from: node_id, to: child_id });
        queue.push({ node: child_value, [name_key]: child_key });
        // keep track of the parent-child relationship
        this.nodes[node_id][child_entries_key].push(child_id);
      });
    }
    return { nodes: this.nodes, edges: this.edges };
  };
}
