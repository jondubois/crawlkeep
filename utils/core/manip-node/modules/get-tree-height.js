import { typeOf } from "../../type-of.js";
import { isEmptyObj } from "../../check/modules/is-empty-obj.js";
import { isJsonArray } from "../../check/modules/is-json-array.js";

import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Get the height of a hierarchical tree, as the maximum depth.
 * The tree is organized into levels, with the root node at level 0, its children at level 1, and so on.
 * The depth of a node is the number of edges from the root to the node, aka the number of levels in the tree.
 * @param {Object} root_node - The root node of the tree.
 * @returns {number} - The height of the tree.
 */
export function getTreeHeight(root_node) {
  param_validator.validateKeyedObj(root_node);

  if (isEmptyObj(root_node)) {
    return 0;
  }

  const queue = [{ node: root_node, depth: 0 }];
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
}
