import {
  typeOf,
  isEmptyObj,
  isJsonArray,
  deDupArr,
  extractFromObjBy,
} from "../../utils/index.js";

// local imports
import { NodesEdgesCollectionParser } from "./nodes-edges-collection-parser.js";
import { BaseParser } from "./base/base-parser.js";
const base_parser = new BaseParser();
import param_validator from "./param-validator.js";

/**
 * @class TreeParser
 * @classdesc This class provides various methods to parse and manipulate hierarchical tree structures.
 * @typedef {Object} NodeTree. A node is of type Object. Child nodes are contained in an Array of Objects.
 * Each node in a tree has zero or more child nodes.
 * All nodes have exactly one parent, except the topmost root node, which has none.
 * Child nodes with the same parent are sibling nodes.
 * An internal node (also known as an inner node, inode for short, or branch node) is any node of a tree that has child nodes.
 * Similarly, an external node (also known as an outer node, leaf node, or terminal node) is any node that does not have child nodes.
 * The height of a node is the length of the longest downward path to a leaf from that node.
 * The height of the root is the height of the tree.
 * The depth of a node is the length of the path to its root (i.e., its root path).
 * Each non-root node can be treated as the root node of its own subtree.
 * @property {NodeTree[]} [children] - An array of child nodes.
 *
 * @method isLeaf
 * @method isContextuallyUnique
 * @method isHierarchical
 * @method getDuplicateNodes
 * @method getAbnormalParents
 * @method getTreeHeight
 * @method getNode
 * @method getTreeNodes
 * @method getLeafNodes
 * @method getLeafNodesBy
 * @method getLeafNodesIterativePostOrderDFT
 * @method toFlatStructure
 * @method toAdjacencyListBFTwID
 * @method toNodeEdgeColBFTinAOFwID
 * @method toNodeEdgeColBFTinAOFnoID
 * @method toNodeEdgeColBFTinAOFnoIDcascading
 * @method toNodeEdgeColBFTinAOFnoIDcascadingBy
 *
 * @todo Check if getLeafNodes()  method should be turned into taking an optional param
 */
export class TreeParser extends BaseParser {
  constructor() {
    super();
    this.root_node = {};
    this.nodes = [];
    this.edges = [];
    // Bind methods
    this.getNode = this.getNode.bind(this);
  }

  // get child_entries_key() {
  //   return this.child_entries_key;
  // }

  // get node_name_key() {
  //   return this.node_name_key;
  // }

  // get node_id_key() {
  //   return this.node_id_key;
  // }

  setStateTo = (root_node, child_entries_key = this.child_entries_key) => {
    param_validator.validateKeyedObj(root_node);
    param_validator.validateStringIsNotEmpty(child_entries_key);

    this.root_node = root_node;
    // reset attributes
    this.nodes = [];
    this.edges = [];
  };

  isLeaf = (node, child_entries_key = this.child_entries_key) => {
    param_validator.validateKeyedObj(node);
    param_validator.validateStringIsNotEmpty(child_entries_key);

    return node[child_entries_key].length === 0;
  };

  isContextuallyUnique = (
    name = this.cat_prop,
    child_entries_key = this.child_entries_key,
  ) => {
    param_validator.validateStringIsNotEmpty(name);
    param_validator.validateStringIsNotEmpty(child_entries_key);

    if (isEmptyObj(this.root_node)) {
      return true;
    } // `name` and `child_entries_key` are optional parameters

    const queue = [{ node: this.root_node, parent_name: null }];
    const contextMap = new Map();

    while (queue.length > 0) {
      const { node, parent_name } = queue.shift();

      // contextual uniqueness: the parent node constitutes the unique context in the hierarchy.
      // Two or more nodes can have the same `name`, but not the same combination of `name` / `parent`
      const context = parent_name || "root";
      if (!contextMap.has(context)) {
        contextMap.set(context, new Set());
      }

      const uniq_names = contextMap.get(context);
      if (uniq_names.has(node[name])) {
        // duplicate found
        return false;
      } else {
        uniq_names.add(node[name]);
      }

      if (node[child_entries_key] && Array.isArray(node[child_entries_key])) {
        for (const child of node[child_entries_key]) {
          queue.push({ node: child, parent_name: node[name] });
        }
      }
    }
    return true;
  };

  // check if a parent mistakenly appears as a child, mistakenly leading to a circular reference
  isHierarchical = (
    name = this.cat_prop,
    child_entries_key = this.child_entries_key,
  ) => {
    param_validator.validateStringIsNotEmpty(name);
    param_validator.validateStringIsNotEmpty(child_entries_key);

    if (isEmptyObj(this.root_node)) {
      return true;
    } // `name` and `child_entries_key` are optional parameters

    const queue = [this.root_node];
    const parentSet = new Set();

    while (queue.length > 0) {
      const node = queue.shift();

      parentSet.add(node[name]); // adds the current node to the parent set

      if (node[child_entries_key] && Array.isArray(node[child_entries_key])) {
        for (const child of node[child_entries_key]) {
          if (parentSet.has(child[name])) {
            return false; // parent found as a child
          }
          queue.push(child);
        }
      }
    }
    return true;
  };

  getDuplicateNodes = (
    name = this.cat_prop,
    child_entries_key = this.child_entries_key,
  ) => {
    param_validator.validateStringIsNotEmpty(name);
    param_validator.validateStringIsNotEmpty(child_entries_key);

    if (isEmptyObj(this.root_node)) {
      return [];
    }

    const queue = [{ node: this.root_node, parent_name: null }];
    const contextMap = new Map();
    const duplicates = [];

    while (queue.length > 0) {
      const { node, parent_name } = queue.shift();

      // contextual uniqueness
      const context = parent_name || "root";
      if (!contextMap.has(context)) {
        contextMap.set(context, new Set());
      }

      const uniq_names = contextMap.get(context);
      if (uniq_names.has(node[name])) {
        duplicates.push(node); // stacks duplicates: objects are passed by reference
      } else {
        uniq_names.add(node[name]);
      }

      if (node[child_entries_key] && Array.isArray(node[child_entries_key])) {
        for (const child of node[child_entries_key]) {
          queue.push({ node: child, parent_name: node[name] });
        }
      }
    }
    return deDupArr(duplicates);
  };

  /**
   * Lists the parents that also appear as children in the tree, as exceptions.
   *
   * @param {String} name . The name of the parent category
   * @param {String} child_entries_key . The name of the child entries property
   * @returns {Array<Object>} . An array of objects representing the abnormal parents
   */
  getAbnormalParents = (
    name = this.cat_prop,
    child_entries_key = this.child_entries_key,
  ) => {
    param_validator.validateStringIsNotEmpty(name);
    param_validator.validateStringIsNotEmpty(child_entries_key);

    const abnormalParents = [];

    if (isEmptyObj(this.root_node)) {
      return abnormalParents;
    }

    const queue = [this.root_node];
    const parentSet = new Set();

    while (queue.length > 0) {
      const node = queue.shift();

      parentSet.add(node[name]); // adds the current node to the parent set

      if (node[child_entries_key] && Array.isArray(node[child_entries_key])) {
        for (const child of node[child_entries_key]) {
          if (parentSet.has(child[name])) {
            abnormalParents.push(child); // adds abnormal parent to the list
          }
          queue.push(child);
        }
      }
    }
    return abnormalParents;
  };

  /**
   * @description Get the height of a hierarchical tree, as the maximum depth.
   * The tree is organized into levels, with the root node at level 0, its children at level 1, and so on.
   * The depth of a node is the number of edges from the root to the node, aka the number of levels in the tree.
   *
   * @param {Object} root_node - The root node of the tree.
   * @returns {number} - The height of the tree.
   */
  getTreeHeight = () => {
    // TODO - parama validation
    // if (!this.isHierarchical()) {
    //   throw new TypeError(
    //     `getTreeHeight - Invalid argument. Expected ${
    //       this.root_node
    //     } to be a hierarchical node tree. Instead, was passed ${typeOf(
    //       this.root_node,
    //     )}`,
    //   );
    // }
    if (isEmptyObj(this.root_node)) {
      return 0;
    }

    const queue = [{ node: this.root_node, depth: 0 }];
    let max_depth = 0;

    while (queue.length > 0) {
      const { node, depth } = queue.shift();
      max_depth = Math.max(max_depth, depth);

      const nested_objs = Object.fromEntries(
        Object.entries(node).filter(
          ([key, val]) => typeof val === "object" && val !== null,
        ),
      );

      if (!isEmptyObj(nested_objs)) {
        for (const [key, val] of Object.entries(nested_objs)) {
          if (Array.isArray(val) && isJsonArray(val)) {
            // nesting level is an Array of keyed Objects
            val.forEach((n) => {
              queue.push({ node: n, depth: depth + 1 });
            });
          } else if (typeOf(val) === "Object") {
            // nesting level is a keyed object
            queue.push({ node: val, depth: depth + 1 });
          }
        }
      }
    }
    return max_depth;
  };

  /**
   * @description From a given node (defaults to root node), cascading traversal (child node are keyed objects) of a node tree
   * to retrieve the property value at the tail end of the path.
   * The path segments are stored in order in `abs_path_segments`.
   *
   * @requires branch of the node tree to be a cascading node, where every child node is a keyed Object.
   *
   * @param {NodeTree} root_node - The root node of the tree.
   * @param {Array<string>} abs_path_segments - Segments that compose the absolute path, from the root node to the target nested value.
   * @returns {*} - The value at the tail end of the path, or `undefined` if not found.
   *
   */
  getValAtNodeCascading = (abs_path_segments, root_node = this.root_node) => {
    param_validator.validateArrayOfStrings(abs_path_segments);
    param_validator.validateKeyedObj(root_node);

    if (!abs_path_segments.length) return root_node;
    return abs_path_segments.reduce(
      (acc, seg) => acc && acc[seg],
      root_node,
    ); /* Short-Circuiting:
    The && operator ensures that if `acc` is ever falsy, the entire expression evaluates to `undefined` for subsequent iterations.
    This means that if any segment in the path does not exist, the function will return `undefined` */
  };

  /**
   * Recursively traverses a node tree according to the mask,
   * to get the node at the tail end of mask.
   * Follows the path described in the mask by checking that the:
   * - keys in the mask are present in the node
   * - data type of the values in the mask, matches the data type of the values in the node
   * For the base case node of the mask value, extract the corresponding node value.
   * Being a recursive function, `getNode` needs to call itself.
   * Lambda expressions (arrow functions) do not have their own this context and cannot reference themselves by name.
   * Therefore, they are not suitable for defining recursive methods.
   * Instead, the method is bound to the instance of the class in the constructor.
   * @param {Object} mask - The mask object that guides the traversal from the root node through the tree.
   * @param {Object|Array} [node_tree=this.root_node] - The current node tree to traverse.
   * @return {Array} - An array of nodes located at the tail end of the mask (empty Array if not found).
   */
  getNode(mask, node_tree = this.root_node) {
    param_validator.validateKeyedObj(mask);
    param_validator.validateKeyedObj(node_tree);

    if (isEmptyObj(node_tree)) {
      return [node_tree];
    }

    // check if all keys in `mask` match the ones in `node_tree`
    if (!Object.keys(mask).every((key) => key in node_tree)) {
      return [];
    }

    // check if the data type of all values in `mask`,
    // matches the one of the values in `node_tree`
    if (
      !Object.entries(mask).every(
        ([key, mask_val]) => typeOf(mask_val) === typeOf(node_tree[key]),
      )
    ) {
      return [];
    }

    // for every key of mask, check if there's a degree of nesting (ie. `mask_val` is an Array or keyed Object)
    const nested_objs = Object.fromEntries(
      Object.entries(mask).filter(
        ([mask_key, mask_val]) => typeof mask_val === "object",
      ),
    );

    if (!isEmptyObj(nested_objs)) {
      // if nesting, recurse on `node_tree[key]` and `mask[key]`
      return Object.entries(nested_objs).reduce((acc, [key, mask_val]) => {
        const node_val = node_tree[key];
        // `node_val` is an Array was checked above, need to further check if Array of keyed Objects
        if (
          Array.isArray(mask_val) &&
          Array.isArray(node_val) &&
          isJsonArray(mask_val) &&
          isJsonArray(node_val)
        ) {
          // nesting level is an Array of keyed Objects
          node_val.forEach((n) => {
            // `acc` hoists the values of the leaf nodes
            acc = acc.concat(this.getNode(mask_val[0], n));
          });
        } else if (typeOf(mask_val) === "Object") {
          // nesting level is a keyed object
          acc = acc.concat(this.getNode(mask_val, node_val));
        } else {
          if (typeOf(mask_val) === typeOf(node_val)) {
            // base case is reached: `mask_val` is an Array of primitives or an Object; both can be empty.
            // `node_val` is an object (e.g. Array, keyed Objects, etc), not empty (we know it from upstream check)
            acc = deDupArr([...acc, node_tree]);
          }
        }
        return acc;
      }, []);
    }
    // both, `mask_val` and `node_val` are primitives
    return [node_tree];
  }

  /**
   * @description Collects all nodes pertaining to a given sub-tree `node` using depth-first traversal.
   * @param {Object} node - The root node of the sub-tree.
   * @param {string} child_entries_key - The property name that represents the children of each node.
   * @returns {Array} - An array of all nodes in the sub-tree.
   */
  getTreeNodes = (
    node = this.root_node,
    child_entries_key = this.child_entries_key,
  ) => {
    param_validator.validateKeyedObj(node);
    param_validator.validateStringIsNotEmpty(child_entries_key);

    const stack = [node];
    const sub_tree_nodes = [];

    while (stack.length > 0) {
      const current_node = stack.pop();
      sub_tree_nodes.push(current_node);

      const children = current_node?.[child_entries_key];
      if (children && Array.isArray(children)) {
        for (const child of children) {
          stack.push(child);
        }
      }
    }

    return sub_tree_nodes;
  };

  /**
   * @todo - it seems `node_name_key` was kept to allow `getPathToNodeBy` to work
   */
  getLeafNodes = () => {
    const n_e_coll_parser = new NodesEdgesCollectionParser();
    const curr_n_e_coll = this.toNodeEdgeColBFTinAOFnoIDcascadingBy();
    n_e_coll_parser.setStateTo(curr_n_e_coll);
    return n_e_coll_parser.getLeafNodes().map((node) => {
      // clear clutter
      delete node[this.node_id_key];
      // delete node[this.node_name_key];
      delete node[this.child_entries_key];
      return node;
    });
  };

  // Breadth: The number of leaves.
  /**
   * @description Iterative depth-first traversal of an n-ary (non-binary) tree.
   * A leaf node is defined as a node aka keyed Object with a property whose:
   * - key is `child_entries_key`,
   * - value is not an Object, nor an Array of Objects, with a `child_entries_key` key.
   *
   * /!\ beware of criteria that are parent nodes, but also hold `keyword`, `regex_pattern` props
   *
   * @param {Object} node - The root node of the tree.
   * @param {string} child_entries_key - The property name that represents the children of each node.
   * @returns {Array} - An array of leaf nodes.
   * @complexity
   * Time complexity: O(n), where n is the number of nodes in the tree.
   * Space complexity: O(h), where h is the height of the tree (due to the stack used for traversal).
   */
  getLeafNodesBy = (
    node = this.root_node,
    child_entries_key = this.child_entries_key,
  ) => {
    param_validator.validateKeyedObj(node);
    param_validator.validateStringIsNotEmpty(child_entries_key);

    if (isEmptyObj(node)) {
      return [node];
    }

    const stack = [node];
    const leaf_nodes = [];

    while (stack.length > 0) {
      const node = stack.pop();

      const val = node?.[child_entries_key];
      if (Array.isArray(val)) {
        // /!\ beware of criteria that are parent nodes, but also hold `keyword`, `regex_pattern` props
        if (isJsonArray(val)) {
          val.forEach((child) => stack.push(child));
        } else {
          leaf_nodes.unshift(node);
        }
      }
    }
    return leaf_nodes;
  };

  /**
   * Returns an array of leaf nodes using an iterative post-order depth-first traversal.
   * @description Iterative post-order depth-first traversal of an n-ary (non-binary) tree.
   * A leaf node is defined as a node which has a children property ie. whose key is `child_entries_key` and value is `[]`.
   * In a post-order traversal, the algo visits the child nodes from left to right (LRN) first, then the parent node.
   * Visiting child nodes takes precedence over checking the parent node.
   * Child nodes need to be checked prior to their parent node. Only after all child nodes are checked,
   * can we backtrack to check the parent node.
   *
   * /!\ beware of criteria that are parent nodes, but also hold `keyword`, `regex_pattern` props
   *
   * @param {string} child_entries_key - The property name that represents the children of each node.
   * @returns {Array} - An array of leaf nodes.
   *
   * @complexity
   * Time complexity: O(n), where n is the number of nodes in the tree.
   * Space complexity: O(h), where h is the height of the tree (due to the stack used for traversal).
   */
  getLeafNodesIterativePostOrderDFT = (
    child_entries_key = this.child_entries_key,
  ) => {
    param_validator.validateStringIsNotEmpty(child_entries_key);

    if (isEmptyObj(this.root_node)) {
      return [];
    }

    let stack = [this.root_node];
    const visited = new Set();
    let leaf_nodes = [];

    while (stack.length > 0) {
      const node = stack.pop(); // LIFO
      const children = node?.[child_entries_key];

      if (visited.has(node)) {
        if (children && Array.isArray(children) && children.length === 0) {
          // follow Post-Order Traversal: left, right, root (LRN)
          leaf_nodes.unshift(node); // adds the specified elements to the beginning of `leaf_nodes`
        }
      } else {
        visited.add(node);
        stack.push(node); /* push back either the: 
                            - parent node, to backtrack and check it after its children
                            - child node, to bounce back LIFO in the next iteration and be checked right away */

        if (children && Array.isArray(children)) {
          stack.push(...children); // same order of addition to the stack as a loop
        }
      }
    }
    return leaf_nodes;
  };

  /**
   * Returns an array of leaf nodes using an iterative post-order breadth-first traversal.
   * @description Iterative post-order breadth-first traversal of an n-ary (non-binary) tree.
   * A leaf node is defined as a node which has a children property ie. whose key is `child_entries_key` and value is `[]`.
   * In a post-order traversal, the algo visits the child nodes from left to right (LRN) first, then the parent node.
   * Visiting child nodes takes precedence over checking the parent node.
   * Child nodes need to be checked prior to their parent node. Only after all child nodes are checked,
   * can we backtrack to check the parent node.
   *
   * @param {string} child_entries_key - The property name that represents the children of each node.
   * @returns {Array} - An array of leaf nodes.
   *
   * @todo - /!\ to be tested /!\
   */
  getLeafNodesIterativePostOrderBFT = (
    child_entries_key = this.child_entries_key,
  ) => {
    param_validator.validateStringIsNotEmpty(child_entries_key);

    if (isEmptyObj(this.root_node)) {
      return [];
    }

    const queue = [this.root_node];
    const visited = new Set();
    const nodes = [];
    const leaf_nodes = [];

    // Perform breadth-first traversal to collect nodes
    while (queue.length > 0) {
      const node = queue.shift(); // FIFO
      const children = node?.[child_entries_key];

      if (visited.has(node)) {
        continue;
      }

      visited.add(node);
      nodes.push(node);

      if (children && Array.isArray(children)) {
        queue.push(...children); // same order of addition to the queue
      }
    }

    // Process nodes in reverse order to ensure post-order processing
    while (nodes.length > 0) {
      const node = nodes.pop(); // LIFO
      const children = node?.[child_entries_key];

      if (children && Array.isArray(children) && children.length === 0) {
        leaf_nodes.push(node); // adds the specified elements to the end of `leaf_nodes`
      }
    }

    return leaf_nodes;
  };

  toFlatStructure = (child_entries_key = this.child_entries_key) => {
    param_validator.validateStringIsNotEmpty(child_entries_key);

    if (isEmptyObj(this.root_node)) {
      return [];
    } // `child_entries_key` are optional parameters

    const queue = [this.root_node];
    const flattened_tree = [];

    while (queue.length > 0) {
      const curr_node = queue.shift();
      flattened_tree.push(curr_node);

      if (
        curr_node[child_entries_key] &&
        Array.isArray(curr_node[child_entries_key])
      ) {
        for (const child of curr_node[child_entries_key]) {
          queue.push(child);
        }
      }
    }
    return flattened_tree;
  };

  // Adjacency List (not Array of Objects)
  toAdjacencyListBFTwID = (
    node = this.root_node,
    child_entries_key = this.child_entries_key,
  ) => {
    param_validator.validateKeyedObj(node);
    param_validator.validateStringIsNotEmpty(child_entries_key);

    if (isEmptyObj(node)) {
      return node;
    }

    const adjacencyList = {};
    const queue = [node];

    while (queue.length > 0) {
      const curr_node = queue.shift();
      /* to avoid data duplication and reduce memory usage, exclude the `child_entries_key` property
      now that the representation of the hierarchy is being shifted to the edges */
      const { [child_entries_key]: _, ...all_props_except_child_subtree } =
        curr_node;
      const nodeId = curr_node[this.node_id_key];

      if (!adjacencyList[nodeId]) {
        adjacencyList[nodeId] = {
          ...all_props_except_child_subtree,
          edges: [],
        };
      }

      if (
        curr_node[child_entries_key] &&
        Array.isArray(curr_node[child_entries_key])
      ) {
        for (const child of curr_node[child_entries_key]) {
          adjacencyList[nodeId].edges.push(child[this.node_id_key]);
          queue.push(child);
        }
      }
    }
    return adjacencyList;
  };

  //
  /**
   * @description sets `this.nodes` and `this.edges` nodes & edges collections.
   * Breadth-First Traversal (BFT) in Array of Objects Format (AOF, not Adjacency List)
   * @param {boolean} is_child_entries_kept - Indicates whether to keep child entries in the result.
   * @param {string} node_id_key - The property name that represents the ID of each node.
   * @returns nodes & edges collections in a container
   */
  toNodeEdgeColBFTinAOFwID = (
    is_child_entries_kept = false,
    node_id_key = base_parser.node_id_key,
  ) => {
    param_validator.validateBoolean(is_child_entries_kept);
    param_validator.validateStringIsNotEmpty(node_id_key);

    const node = this.root_node;
    const child_entries_key = this.child_entries_key;

    if (isEmptyObj(node)) {
      console.warn(
        `${this.constructor.name}.toNodeEdgeColBFTinAOFwID - The tree node is empty.`,
      );
      return { nodes: this.nodes, edges: this.edges };
    } // never gets executed

    const queue = [node];
    const nodeMap = new Map();
    const edgeSet = new Set();

    while (queue.length > 0) {
      const curr_node = queue.shift();

      if (!(node_id_key in curr_node)) {
        throw new ReferenceError(
          `${
            this.constructor.name
          }.toNodeEdgeColBFTinAOFwID - Invalid input. Expected ${curr_node} to be a keyed Object with, at least, the property ${node_id_key}. Instead, was passed ${typeOf(
            curr_node,
          )}`,
        );
      }

      /* to avoid data duplication and reduce memory usage, exclude the `child_entries_key` property
      now that the representation of the hierarchy is being shifted to the edges */
      const all_props_except_child_subtree = extractFromObjBy(
        curr_node,
        [child_entries_key],
        true,
      );

      if (!nodeMap.has(curr_node[node_id_key])) {
        nodeMap.set(
          curr_node[node_id_key],
          is_child_entries_kept ? curr_node : all_props_except_child_subtree,
        );
      }

      if (
        curr_node[child_entries_key] &&
        Array.isArray(curr_node[child_entries_key])
      ) {
        for (const child of curr_node[child_entries_key]) {
          edgeSet.add({ from: curr_node[node_id_key], to: child[node_id_key] });
          queue.push(child);
        }
      }
    }

    this.nodes = Array.from(nodeMap.values());
    this.edges = Array.from(edgeSet);
    return { nodes: this.nodes, edges: this.edges };
  };

  /* TODO - Check if getLeafNodes()  method should be turned into taking an optional param,
   which in turn would require toNodeEdgeColBFTinAOFnoIDcascadingBy() to be updated.. */
  // toNodeEdgeColBFTinAOFwIDchildEntriesKept = (
  //   node = this.root_node,
  //   child_entries_key = this.child_entries_key,
  // ) => {
  //   param_validator.validateKeyedObj(node);
  //   param_validator.validateString(child_entries_key);

  //   if (!(this.node_id_key in node)) {
  //     throw new TypeError(
  //       `${
  //         this.constructor.name
  //       }.toNodeEdgeColBFTinAOFwID - Invalid input. Expected ${node} to be a keyed Object with, at least, the property "id". Instead, was passed ${typeOf(
  //         node,
  //       )}`,
  //     );
  //   }
  //   if (isEmptyObj(node)) {
  //     console.warn(
  //       `${this.constructor.name}.toNodeEdgeColBFTinAOFwID - The tree node is empty.`,
  //     );
  //     return { nodes: this.nodes, edges: this.edges };
  //   } // never gets executed

  //   // Breadth-First Traversal (BFT)
  //   const queue = [node];
  //   while (queue.length > 0) {
  //     const curr_node = queue.shift();
  //     this.nodes.push(curr_node);

  //     if (curr_node[child_entries_key] && Array.isArray(curr_node[child_entries_key])) {
  //       for (const child of curr_node[child_entries_key]) {
  //         this.edges.push({ from: curr_node[this.node_id_key], to: child[this.node_id_key] });
  //         queue.push(child);
  //       }
  //     }
  //   }
  //   return { nodes: this.nodes, edges: this.edges };
  // };

  toNodeEdgeColBFTinAOFnoID = (
    node = this.root_node,
    child_entries_key = this.child_entries_key,
  ) => {
    // Breadth-First Traversal (BFT) in Array of Objects Format (AOF)
    param_validator.validateKeyedObj(node);
    param_validator.validateStringIsNotEmpty(child_entries_key);

    param_validator.warnEmptyObj(node);

    // reset attributes
    this.nodes = [];
    this.edges = [];
    const queue = [node];

    while (queue.length > 0) {
      const curr_node = queue.shift();
      const node_id = this.nodes.length;
      /* to avoid data duplication and reduce memory usage, exclude the `child_entries_key` property
        now that the representation of the hierarchy is being shifted to the edges */
      const all_props_except_child_subtree = extractFromObjBy(
        curr_node,
        [child_entries_key],
        true,
      );
      this.nodes.push({
        ...{ [this.node_id_key]: node_id },
        ...all_props_except_child_subtree,
      });

      if (
        curr_node[child_entries_key] &&
        Array.isArray(curr_node[child_entries_key])
      ) {
        curr_node[child_entries_key].forEach((child) => {
          let child_id = node_id + queue.length + 1; // ID increments from parent ID, +1 for each child node
          this.edges.push({ from: node_id, to: child_id });
          queue.push(child);
        });
      }
    }
    return { nodes: this.nodes, edges: this.edges };
  };

  /**
   * Converts a hierarchical tree structure into node & edge collections using Breadth-First Traversal (BFT).
   *
   * @requires node tree to be a cascading node, where every child node is a keyed Object.
   *
   * @description
   * This function takes a hierarchical tree structure and converts it into a collection of nodes and edges.
   * Each node is assigned a default ID based on its position in the traversal order. The function assumes
   * that all nodes in the tree do not have an ID property.
   *
   * @param {Object} root_node - The node tree to convert. Implicitly supplied by the class instance `this.root_node`.
   *
   * @returns {Object} An object containing two arrays: `nodes` and `edges`.
   * - `nodes`: An array of node objects, each with an `[this.node_id_key]` and `name_key`.
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
   * Converts a hierarchical tree structure into node & edge collections using Breadth-First Traversal (BFT).
   *
   * @requires node tree to be a cascading node, where every child node is a keyed Object. Stops at Array of Objects.
   *
   * @description
   * This function takes a hierarchical tree structure and converts it into a collection of nodes and edges.
   * Each node is assigned a default ID based on its position in the traversal order. The function assumes
   * that all nodes in the tree do not have an ID property.
   * The parent node's key is retained in the property `name_key`.
   *
   * @param {String} name_key - The name of the child node key.
   *
   * @returns {Object} An object containing two arrays: `nodes` and `edges`.
   * - `nodes`: An array of node objects, each with an `[this.node_id_key]` and `name_key`.
   * - `edges`: An array of edge objects, each with `from` and `to` properties based on node IDs.
   *
   * @todo - why is `name_key` a parameter? It should be a class property.
   */
  toNodeEdgeColBFTinAOFnoIDcascadingBy = (name_key = this.node_name_key) => {
    param_validator.validateStringIsNotEmpty(name_key);

    const node_id_key = this.node_id_key;
    const child_entries_key = this.child_entries_key;
    const queue = [
      { node: this.root_node, [name_key]: Object.keys(this.root_node)[0] },
    ]; // name_key has to be a String

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

  // /* DNU Not tested. Works but, the nodes & edges collection should be comprised of:
  // - root node
  // - every intermediary nodes */
  // /**
  //  * @description Converts a hierarchical tree structure into node & edge collections.
  //  * Traversal goes through Array of Objects.
  //  * Leaf nodes are defined as a keyed Object.
  //  * Breadth-First Traversal (BFT) in Array of Objects Format (AOF).
  //  * Each node is assigned a default ID based on its position in the traversal order, which overwrites any existing ID.
  //  *
  //  * @param {Object} root_node - The node tree to convert.
  //  *
  //  * @returns {Object} An object containing two arrays: `nodes` and `edges`.
  //  * - `nodes`: An array of node objects, each with an `[this.node_id_key]` and `name_key`.
  //  * - `edges`: An array of edge objects, each with `from` and `to` properties based on node IDs.
  //  * @returns
  //  */
  // toNodeEdgeColBFTinAOFnoIDcascadingBy1(node_tree = this.root_node) {
  //   if (typeOf(node_tree) !== "Object") {
  //     throw new TypeError(
  //       `${this.constructor.name} - Invalid input. Expected ${node_tree} to be a keyed Object. Instead, was passed ${typeOf(node_tree)}`,
  //     );
  //   }
  //   if (isEmptyObj(node_tree)) {
  //     return [node_tree];
  //   }

  //   const nodes = [];
  //   const edges = [];
  //   const queue = [{ node: node_tree, parent_id: null }];

  //   while (queue.length > 0) {
  //     const { node: curr_node, parent_id } = queue.shift();
  //     const node_id = nodes.length;
  //     const all_props_except_child_subtree = {};
  //     const children = [];

  //     Object.entries(curr_node).forEach(([key, value]) => {
  //       if (Array.isArray(value) && isJsonArray(value)) {
  //         // nesting level is an Array of keyed Objects
  //         value.forEach((item) => {
  //           children.push({ node: item, parent_id: node_id });
  //         });
  //       } else if (typeOf(value) === "Object") {
  //         // nesting level is a keyed object
  //         children.push({ node: value, parent_id: node_id });
  //       } else {
  //         // base case is reached when `value` is a primitive or an Array of primitives or an Object; both can be empty.
  //         all_props_except_child_subtree[key] = value;
  //       }
  //     });

  //     nodes.push({
  //       [this.node_id_key]: node_id,
  //       ...all_props_except_child_subtree,
  //     });

  //     if (parent_id !== null) {
  //       edges.push({ from: parent_id, to: node_id });
  //     }

  //     queue.push(...children);
  //   }

  //   return { nodes, edges };
  // }

  /* Not tested. wrote it for a specific case */
  getLeafNodeIsObjCascading(node_tree = this.root_node) {
    param_validator.validateKeyedObj(node_tree);

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
   * @description Transforms a node tree into a cascading node tree,
   * where a parent node is expected to have as child nodes, either a keyed Object or an Array of keyed Objects
   * by:
   * - turning the value stored in `this.node_name_key` into the key of the parent object
   * - dropping the `child_entries_key` property.
   *
   * @param {Object} node - The root node of the tree.
   * @param {string} [child_entries_key=this.child_entries_key] - The property key used for child nodes.
   * @returns {Object} The transformed node tree.
   */
  toCascadingNodeTreeBy = (child_entries_key = this.child_entries_key) => {
    param_validator.validateStringIsNotEmpty(child_entries_key);

    const node = this.root_node;

    const transform = (node) => {
      const cascading_node_tree = {};
      const nodeName = node[this.node_name_key];
      const children = node[child_entries_key] || [];

      // remove the "name" and "child_entries" properties from the node
      const {
        [this.node_name_key]: placeholder1,
        [child_entries_key]: placeholder2,
        ...rest
      } = node;

      // turn Array of child nodes into cascading keyed Objects
      const transformedChildren = children.reduce((acc, child) => {
        return { ...acc, ...transform(child) };
      }, {});

      cascading_node_tree[nodeName] = { ...rest, ...transformedChildren };

      return cascading_node_tree;
    };

    /* the top most parent node, was only created in the nodes & edges collection to
    store the initial parent-child relationship.
    It's dropped by initiating the iteration with its children directly */
    return (node[child_entries_key] || []).reduce((acc, child) => {
      return { ...acc, ...transform(child) };
    }, {});
  };
}
