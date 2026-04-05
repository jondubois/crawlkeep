import { typeOf } from "../../type-of.js";

/**
 * @description Depth-First Traversal of a tree structure to get all leaf nodes.
 * A leaf node is defined as a keyed Object with no nested keyed Objects,
 * i.e. either an empty object or an object with non-object properties.
 *
 * @requires child node to be a keyed Object
 * @param {Object} root_node - The root node of the tree to traverse.
 * @returns {Object[]} An array of leaf nodes.
 * @throws {TypeError} If the root_node is not a keyed Object.
 * @complexity O(n) - where n is the number of nodes in the tree.
 *
 */
export function getLeafNodesCascadingDFT(root_node) {
  if (typeOf(root_node) !== "Object") {
    throw new TypeError(
      `${getLeafNodesCascadingDFT.name} - Invalid input. Expected ${
        arguments[0]
      } to be a keyed Object. Instead, was passed ${typeOf(arguments[0])}`,
    );
  }
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
