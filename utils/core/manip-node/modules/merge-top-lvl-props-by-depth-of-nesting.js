import { typeOf } from "../../type-of.js";
import { isEmptyObj } from "../../check/modules/is-empty-obj.js";
import { intersection } from "../../manip-arr/modules/superpose-arr.js";

import { TreeParser } from "../../../../classes/modules/hierarchical-tree-parser.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Merges two cascading node trees by comparing the depth of their top-level properties.
 * If a property exists in both Objects, the property with the greater depth is retained.
 * In case of a tie, the value from the source (ie. `node_tree2`) supersedes (similarly to `Object.assign`).
 * @variation
 * __Exception1__: if common property is top-level e.g.
 * const node_tree1 = { b: { c: 2 } };
 * const node_tree2 = { b: ["d"] };
 * it defaults to `Object.assign`.
 * __Exception2__: if common property is nested e.g.
 * const node_tree1 = { a: { b: { c: 2 } } };
 * const node_tree2 = { a: { b: ["d"] } };
 * const result = mergeTopLevelPropsByDepthOfNesting(node_tree1, node_tree2);
 * // expected output: { a: { b: { c: 2 } } });
 * depth of nesting supercedes
 * @requires node tree to be a cascading node, where every child node is a keyed Object.
 * /!\ It's meant to apply to nested objects with a keyed Object as values (not primitives, Array, etc)
 * @param {Object} node_tree1 - The first cascading node tree.
 * @param {Object} node_tree2 - The second cascading node tree.
 * @returns {Object} - The merged object.
 * @example
 * const node_tree1 = { a: { b: { c: 2 } } };
 * const node_tree2 = { a: { b: 1 } };
 * const output = mergeTopLevelPropsByDepthOfNesting(node_tree1, node_tree2);
 * // expected output: { a: { b: { c: 2 } } });
 *
 */
export function mergeTopLevelPropsByDepthOfNesting(node_tree1, node_tree2) {
  param_validator.validateKeyedObj(arguments[0]);
  param_validator.validateKeyedObj(arguments[1]);

  let check;
  if ((check = isEmptyObj(node_tree1)) || isEmptyObj(node_tree2)) {
    return check ? node_tree2 : node_tree1;
  }

  const tree_parser = new TreeParser();
  const acc = {};
  const node_tree1_clone = structuredClone(node_tree1);
  const node_tree2_clone = structuredClone(node_tree2);

  const common_keys = intersection(
    Object.keys(node_tree1_clone),
    Object.keys(node_tree2_clone),
  );

  // merge common properties, based on depth of nesting, into the accumulator
  for (const key of common_keys) {
    if (
      typeOf(node_tree1_clone[key]) !== "Object" ||
      typeOf(node_tree2_clone[key]) !== "Object"
    )
      continue;
    const [node_tree1_depth, node_tree2_depth] = [
      node_tree1_clone,
      node_tree2_clone,
    ].map((obj) => {
      tree_parser.setStateTo(obj[key]);
      return tree_parser.getTreeHeight();
    });

    if (node_tree1_depth > node_tree2_depth) {
      acc[key] = node_tree1_clone[key];
    } else {
      acc[key] = node_tree2_clone[key];
    }
    delete node_tree1_clone[key];
    delete node_tree2_clone[key];
  }

  // merge non-common properties, kept in the clones.
  Object.assign(
    acc,
    node_tree1_clone,
    node_tree2_clone,
  ); /* `Object.assign(target, source1, source2)` copies all enumerable own properties
    from one or more source objects to a target object.
    if the property already exists, its value is overwritten by the value of last source object ie. `source2`.
    That's why, the original `target`, `source` couldn't be used.
    Otherwise, the values in the common properties would have overwritten what the `for..loop` did. */
  return acc;
}

// const node_tree1 = {
//   a: { b: { c: 1 } },
//   d: { e: 2 },
// };
// const node_tree2 = {
//   a: { b: { c: { d: 3 } } },
//   d: { e: { f: 4 } },
// };

// // const expected = {
// //   a: { b: { c: { d: 3 } } },
// //   d: { e: { f: 4 } },
// // };

// const node_tree1 = {
//   middle_management: {
//     xp_in_ms: 12345600000,
//     xp_in_pc: 40,
//   },
// };

// const node_tree2 = {
//   middle_management: {
//     xp_in_ms: 146966400000,
//     xp_in_pc: 100,
//   },
// };

// const output = mergeTopLevelPropsByDepthOfNesting(node_tree1, node_tree2);
// debugger;
