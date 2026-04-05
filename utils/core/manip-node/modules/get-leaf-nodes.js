import { isEmptyObj, isJsonArray } from "../../check/index.js";
import { typeOf } from "../../type-of.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Returns all leaf nodes of a node tree by performing a breadth-first traversal.
 * @param {Object} root - The root node of the tree.
 * @param {string} child_entries_key - The property name that represents the children of each node.
 * @returns {Object[]} - An array of leaf nodes.
 *
 * @todo - /!\ test /!\
 */
function getLeafNodesBFT(root, child_entries_key) {
  param_validator.validateKeyedObj(root);
  param_validator.validateStringIsNotEmpty(child_entries_key);

  const queue = [root];
  const visited = new Set();
  const leaf_nodes = [];

  while (queue.length > 0) {
    const node = queue.shift(); // FIFO
    const children = node?.[child_entries_key];

    if (visited.has(node)) {
      continue;
    }

    visited.add(node);

    if (children && Array.isArray(children) && children.length === 0) {
      leaf_nodes.push(node); // adds the specified elements to the end of `leaf_nodes`
    } else if (children && Array.isArray(children)) {
      queue.push(...children); // same order of addition to the queue as a loop
    }
  }

  return leaf_nodes;
}

/**
 * @description Returns an array of leaf nodes using an iterative post-order depth-first traversal.
 * Iterative post-order depth-first traversal of an n-ary (non-binary) tree.
 * A leaf A leaf node is defined as a node which has a children property ie. whose key is `child_entries_key` and value is `[]`.
 * In a post-order traversal, the algo visits the child nodes (from left to right) first, then the parent node.
 * Visiting child nodes takes precedence over checking the parent node.
 * Child nodes are visited immediately after the parent node was visited.
 * Child nodes need to be checked prior to their parent node. Only after all child nodes are checked,
 * can we backtrack to check the parent node.
 *
 * @param {Object} root - The root node of the tree.
 * @param {string} child_entries_key - The property name that represents the children of each node.
 * @returns {Object[]} - An array of leaf nodes.
 *
 * @complexity
 * Time complexity: O(n), where n is the number of nodes in the tree.
 * Space complexity: O(h), where h is the height of the tree (due to the stack used for traversal).
 */
// TODO - serialise by using a combination of DFS Post-Order traversal and c[n] = d[n] + 1
// Visiting a node is done in two steps:
// - discover: control processes the node
// - checked: control checks whether the node is a leaf node
// Suppose `n` has no children. That is, we will go backtracking once we have discovered `n`.
// That is, we will check whether `n` is a leaf node right after we have discovered it. That is, c[n] = d[n] + 1.
// If a node as no child nodes, then check it against `isLeaf()
// isLeaf(node) {
//     return node["parsed"] === node["visited"] + 1;
//   }
export function getLeafNodesIterativePostOrderDFT(root, child_entries_key) {
  param_validator.validateKeyedObj(root);
  param_validator.validateStringIsNotEmpty(child_entries_key);

  if (isEmptyObj(arguments[0])) {
    return [];
  }

  let stack = [root];
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
}

/**
 * @description Returns all leaf nodes of a node tree by performing a post-order breadth-first traversal.
 * In For post-order traversal, the child nodes are visited before their parent: the entire left subtree is visited, then the entire right subtree, and then the root node of the subtree.
 * Application: to reach the leaves first.
 * @param {Object} root - The root node of the tree.
 * @param {string} child_entries_key - The property name that represents the children of each node.
 * @returns {Object[]} - An array of leaf nodes.
 *
 * @todo review test suite case: should return all leaf nodes of the tree, in post-order
 */
export function getLeafNodesIterativePostOrderBFT(root, child_entries_key) {
  param_validator.validateKeyedObj(root);
  param_validator.validateStringIsNotEmpty(child_entries_key);

  if (isEmptyObj(arguments[0])) {
    return [];
  }

  const queue = [root];
  const visited = new Set();
  const leaf_nodes = [];

  while (queue.length > 0) {
    const node = queue.shift(); // FIFO
    const children = node?.[child_entries_key];

    if (visited.has(node)) {
      continue;
    }

    visited.add(node);

    if (children && Array.isArray(children) && children.length === 0) {
      leaf_nodes.push(node); // adds the specified elements to the end of `leaf_nodes`
    } else if (children && Array.isArray(children)) {
      queue.push(...children); // same order of addition to the queue
    }
  }

  return leaf_nodes;
}

/**
 * @description Iterative depth-first traversal of an n-ary (non-binary) tree.
 * A leaf node is defined as a node aka keyed Object with a property whose:
 * - key is `child_entries_key`,
 * - value is not an Object, or an Array of Objects, with a `child_entries_key` key.
 * @param {Object} root_node - The root node of the tree.
 * @param {string} child_entries_key - The property name that represents the children of each node.
 * @returns {Object[]} - An array of leaf nodes.
 * @complexity
 * Time complexity: O(n), where n is the number of nodes in the tree.
 * Space complexity: O(h), where h is the height of the tree (due to the stack used for traversal).
 */
export function getLeafNodesBy(root_node, child_entries_key) {
  param_validator.validateKeyedObj(root_node);
  param_validator.validateStringIsNotEmpty(child_entries_key);

  if (isEmptyObj(arguments[0])) {
    return undefined;
  }

  const stack = [root_node];
  const leaf_nodes = [];

  while (stack.length > 0) {
    const node = stack.pop();

    // a leaf node has no children
    const val = node?.[child_entries_key];
    if (val) {
      if (Array.isArray(val) && isJsonArray(val)) {
        val.forEach((child) => stack.push(child));
      } else {
        leaf_nodes.unshift(node);
      }
    } else {
      throw new ReferenceError(
        `${getLeafNodesBy.name} - The key to child entries didn't match.`,
      );
    }
  }
  return leaf_nodes;
}

/**
 * @description Depth-First Traversal of a tree structure to get all leaf nodes.
 * A leaf node is defined as a keyed Object with no nested keyed Objects,
 * i.e. either an empty object or an object with non-object properties.
 * @requires child node to be a keyed Object
 * @param {Object} root_node - The root node of the tree to traverse.
 * @returns {Object[]} An array of leaf nodes.
 */
export function getLeafNodesCascadingDFT(root_node) {
  param_validator.validateKeyedObj(root_node);

  const stack = [root_node];
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
}

/**
 * @description Retrieves the leaf node from a cascading (one parent - one child) hierarchical tree node.
 * @param {Object} node - The root node of the tree
 * @returns {Object} - The leaf node of the tree.
 */
export function getLeafNodesCascadingRecursive(node) {
  param_validator.validateKeyedObj(node);
  // check if cascading tree has more than one child
  const vals = Object.values(node);
  if (vals.length > 1) return node;

  const val = vals.shift();
  if (!val || typeOf(val) !== "Object") return node; // base case: child node can only be a keyed Object
  return getLeafNodesCascadingRecursive(val);
}

// /* Didn't test. Use at your own risks */
// export function getLeafNodesDFT1(root_node) {
//   const stack = [root_node];
//   const leaf_nodes = [];

//   while (stack.length > 0) {
//     const node_tree = stack.pop();

//     // Check every key for a degree of nesting (i.e., `val` is an Array or keyed Object)
//     const sub_tree = {};
//     for (const [key, val] of Object.entries(node_tree)) {
//       if (typeof val === "object" && val !== null) {
//         sub_tree[key] = val;
//       }
//     }

//     if (isEmptyObj(sub_tree)) {
//       // Base case: property value is an empty keyed Object
//       leaf_nodes.unshift(node_tree);
//     } else {
//       // Recurse on `sub_tree[key]`
//       for (const node of Object.values(sub_tree)) {
//         if (Array.isArray(node) && isJsonArray(node)) {
//           for (const child of node) {
//             stack.push(child);
//           }
//         } else if (node && typeOf(node) === "Object") {
//           stack.push(node);
//         } else {
//           if (typeOf(node) === "Object") {
//             // Base case: property value is of every other data type than keyed Object
//             leaf_nodes.unshift(node);
//           }
//         }
//       }
//     }
//   }
//   return leaf_nodes;
// }

/**
 * @description Depth-First Traversal of a tree structure to get all leaf nodes.
 * A leaf node is defined as a keyed Object with no nested keyed Objects,
 * i.e. either an empty object or an object with non-object properties.
 * @param {Object} root_node - The root node of the tree to traverse.
 * @returns {Object[]} - An array of reference to the leaf nodes of `root_node`.
 */
export function getLeafNodesDFT(root_node) {
  param_validator.validateKeyedObj(root_node);

  const stack = [root_node];
  const leaf_nodes = [];

  while (stack.length > 0) {
    const node_tree = stack.pop();

    // Filter the values that are objects and not null
    const sub_trees = Object.values(node_tree).filter(
      (val) => typeof val === "object" && val !== null,
    ); /* `typeof null` returns "object", which is misleading because `null` is considered a primitive value.
    This is a known quirk of JavaScript */

    if (!sub_trees.length) {
      // base case: property value is an empty keyed Object
      leaf_nodes.unshift(node_tree);
    } else {
      // recurse on the nested Objects or Array of keyed Objects
      for (const node of sub_trees) {
        if (Array.isArray(node) && isJsonArray(node)) {
          for (const child of node) {
            stack.push(child);
          }
        } else if (node && typeOf(node) === "Object") {
          stack.push(node);
        } else {
          if (typeOf(node) === "Object") {
            // Base case: property value is of every other data type than keyed Object
            leaf_nodes.unshift(node);
          }
        }
      }
    }
  }
  return leaf_nodes;
}

/**
 * @description Depth-First Traversal of a tree structure to get all leaf nodes.
 * A leaf node is defined as a keyed Object with no nested keyed Objects,
 * i.e. either an empty object or an object with non-object properties.
 * @param {Object} root_node - The root node of the tree to traverse.
 * @returns {Object[]} - An array of leaf nodes.
 */
export function getLeafNodesDFTfunctional(root_node) {
  param_validator.validateKeyedObj(root_node);

  const stack = [root_node];
  const leaf_nodes = [];

  while (stack.length > 0) {
    const node_tree = stack.pop();

    // check every key for a degree of nesting (ie. `val` is an Array or keyed Object)
    const sub_tree = Object.fromEntries(
      Object.entries(node_tree).filter(
        ([key, val]) => typeof val === "object" && val !== null,
      ),
    ); /* `typeof null` returns "object", which is misleading because `null` is considered a primitive value.
       This is a known quirk of JavaScript */

    if (isEmptyObj(sub_tree)) {
      // base case: property value is an empty keyed Object
      leaf_nodes.unshift(node_tree);
    } else {
      // recurse on `sub_tree[key]`
      Object.values(sub_tree).forEach((node) => {
        if (Array.isArray(node) && isJsonArray(node)) {
          node.forEach((child) => stack.push(child));
        } else if (node && typeOf(node) === "Object") {
          stack.push(node);
        } else {
          if (typeOf(node) === "Object") {
            // base case: property value is of every other data type than keyed Object
            leaf_nodes.unshift(node);
          }
        }
      });
    }
  }
  return leaf_nodes;
}
