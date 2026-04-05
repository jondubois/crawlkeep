import { isEmptyObj } from "../../check/modules/is-empty-obj.js";
import { typeOf } from "../../type-of.js";

import param_validator from "../../../../classes/modules/param-validator.js";
/**
 * @requires /!\ Only works on chained nodes /!\
 * @description Calculates the depth of nesting in a node tree.
 * @param {Object} node_tree - A node hierarchical tree,
 * with only a root topmost node where
 * each node (except root) has one unique parent and can have multiple children.
 * @returns {number} - The depth of nesting in the object. *
 */
function getTreeHeightCascading(node_tree) {
  param_validator.validateKeyedObj(node_tree);

  if (isEmptyObj(node_tree)) {
    return 0;
  }

  // check if there's a degree of nesting
  // TODO - it's assumed a single path from the root to any node.
  // However, the below and the `for..of` loop allows for multiple paths
  // => /!\ doesn't handle multiple branches from the root
  const nested_objs = Object.fromEntries(
    Object.entries(node_tree).filter(([key, val]) => typeOf(val) === "Object"),
  );

  if (!isEmptyObj(nested_objs) && Object.keys(nested_objs).length === 1) {
    let depth;
    for (const key in nested_objs) {
      depth = getTreeHeightCascading(node_tree[key]);
    }
    return depth + 1;
  }
  // base case: `node_tree[key]` is a primitive
  return 0;
}
// // expected bug
// const obj = { a: 1, f: { g: "test" }, b: { c: 2, d: { e: 3 } } };
// const res = getTreeHeightCascading(obj);
// debugger;
