// local imports
import { isEmptyObj } from "../../check/modules/is-empty-obj.js";
import { isJsonArray } from "../../check/modules/is-json-array.js";
import { isEqualArrays } from "../../check/modules/is-equal-arrays.js";
import { isPartiallyEqualObjs } from "../../check/modules/is-partially-equal-objects.js";
import { deDupArr } from "../../manip-arr/modules/dedup-arr.js";
import { typeOf } from "../../type-of.js";

import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Transforms the leaf nodes of a given object based on a mask and applies a callback function.
 * @param {Object} node - The root node of the object tree to be transformed.
 * @param {Object} mask - The mask object that defines which nodes to transform.
 * @param {Function} callback - The callback function to apply on the matched leaf nodes.
 * @example
 * const node = { key1: { key2: "value2", key3: "value3" } };
 * const mask = { key1: {} };
 * transformLeaf(node, mask, (matchedNode) => console.log(matchedNode));
 * // Outputs: { key2: "value2", key3: "value3" }
 */

export function transformLeaf(node, mask, callback) {
  param_validator.validateKeyedObj(node);
  param_validator.validateKeyedObj(mask);
  param_validator.validateFunction(callback);

  if (isEmptyObj(node)) {
    return;
  }

  // check if all keys in `mask` match the ones in `node`
  if (!Object.keys(mask).every((key) => key in node)) {
    return;
  }

  // check if the data type of all values in `mask`,
  // matches the one of the values in `node`
  if (
    !Object.entries(mask).every(
      ([key, mask_val]) => typeOf(mask_val) === typeOf(node[key]),
    )
  ) {
    return;
  }

  // for every key of mask, check if there's a degree of nesting (ie. `mask_val` is an Array or keyed Object)
  const nested_objs = Object.fromEntries(
    Object.entries(mask).filter(
      ([mask_key, mask_val]) => typeof mask_val === "object",
    ),
  );

  if (!isEmptyObj(nested_objs)) {
    // if nesting, recurse on `node[key]` and `mask[key]`
    Object.entries(nested_objs).forEach(([key, mask_val]) => {
      const node_val = node[key];
      // `node_val` is an Array was checked above, need to further check if Array of keyed Objects
      if (
        Array.isArray(mask_val) &&
        Array.isArray(node_val) &&
        isJsonArray(mask_val) &&
        isJsonArray(node_val)
      ) {
        // nesting level is an Array of keyed Objects
        node_val.forEach((n) => {
          transformLeaf(n, mask_val[0], callback);
        });
      } else if (typeOf(mask_val) === "Object") {
        // nesting level is a keyed object
        transformLeaf(node_val, mask_val, callback);
      } else {
        if (typeOf(mask_val) === typeOf(node_val)) {
          // base case is reached: `mask_val` is an Array of primitives or an Object; both can be empty.
          // `node_val` is an object (e.g. Array, keyed Objects, etc), not empty (we know it from upstream check)
          callback(node);
        }
      }
    });
  } else {
    // base case is reached: both, `mask_val` and `node_val` are primitives
    callback(node);
  }
}

// function callback(node) {
//   console.log(node);
// }
// const node = {
//   key1: {
//     key2: "value2",
//     key3: "value3",
//   },
// };
// const mask = {
//   key1: {},
// };
// transformLeaf(node, mask, callback);
// debugger;

/**
 * @description Recursively captures the values of leaf nodes that match the mask.
 * Follows the path described in the mask by checking that the:
 * - keys in the mask are present in the node
 * - data type of the values in the mask, matches the data type of the values in the node
 * For the base case node of the mask value, extract the corresponding node value
 * @param {Object|Array} node - The current node to check
 * @param {Object} mask - The mask object to filter against
 * @return {Array} - An array of leaf nodes, from the root node, that match the mask.
 */
export function getInternalNode(node, mask) {
  param_validator.validateKeyedObj(node);
  param_validator.validateKeyedObj(mask);

  if (isEmptyObj(node)) {
    return [node];
  }

  // check if all keys in `mask` match the ones in `node`
  if (!Object.keys(mask).every((key) => key in node)) {
    return [];
  }

  // check if the data type of all values in `mask`,
  // matches the one of the values in `node`
  if (
    !Object.entries(mask).every(
      ([key, mask_val]) => typeOf(mask_val) === typeOf(node[key]),
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
    // if nesting, recurse on `node[key]` and `mask[key]`
    return Object.entries(nested_objs).reduce((acc, [key, mask_val]) => {
      const node_val = node[key];
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
          acc = acc.concat(getInternalNode(n, mask_val[0]));
        });
      } else if (typeOf(mask_val) === "Object") {
        // nesting level is a keyed object
        acc = acc.concat(getInternalNode(node_val, mask_val));
      } else {
        if (typeOf(mask_val) === typeOf(node_val)) {
          // base case is reached: `mask_val` is an Array of primitives or an Object; both can be empty.
          // `node_val` is an object (e.g. Array, keyed Objects, etc), not empty (we know it from upstream check)
          acc = deDupArr([...acc, node]);
        }
      }
      return acc;
    }, []);
  }
  // both, `mask_val` and `node_val` are primitives
  return [node];
}

/**
 * @description Recursively searches for exact matches between a node and a mask.
 * @param {Object} node - The object to search within
 * @param {Object} mask - The object that defines the structure, types and end-value to match
 * @returns {Array} An array of objects that match the mask values and types
 * @example
  const node = {
  a: 1,
  b: {
    c: 2,
    d: [ { e: "value" }, { e: 4 } ]
  }
  };
  const mask = {
  b: {
    d: [ { e: "value" } ]
  }
  };
  const result = getLeafExactMatch(node, mask);
  // result: [ { e: "value" } ]
 *
 */
export function getLeafExactMatch(node, mask) {
  param_validator.validateKeyedObj(node);
  param_validator.validateKeyedObj(mask);

  if (isEmptyObj(node)) {
    return [];
  }

  // check if all keys in `mask` match the ones in `node`
  if (!Object.keys(mask).every((key) => key in node)) {
    return [];
  }

  // check if the data type of all values in `mask`,
  // matches the one of the values in `node`
  if (
    !Object.entries(mask).every(
      ([key, mask_val]) => typeOf(mask_val) === typeOf(node[key]),
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
    // if nesting, recurse on `node[key]` and `mask[key]`
    return Object.entries(nested_objs).reduce((acc, [key, mask_val]) => {
      const node_val = node[key];
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
          acc = acc.concat(getLeafExactMatch(n, mask_val[0]));
        });
      } else if (typeOf(mask_val) === "Object") {
        // nesting level is a keyed object
        acc = acc.concat(getLeafExactMatch(node_val, mask_val));
      } else {
        if (typeOf(mask_val) === typeOf(node_val)) {
          // base case is reached: `mask_val` is an Array of primitives or an Object; both can be empty.
          // `node_val` is an object (e.g. Array, keyed Objects, etc), not empty (we know it from upstream check)
          if (
            (Array.isArray(mask_val) &&
              isEqualArrays(Object.values(mask), Object.values(node))) ||
            isPartiallyEqualObjs(mask, node)
          ) {
            acc = deDupArr([...acc, node]);
          }
        }
      }
      return acc;
    }, []);
  }

  // base case is reached: both, `mask_val` and `node_val` are primitives and strictly equal
  if (Object.entries(mask).every(([key, mask_val]) => mask_val === node[key])) {
    return [node];
  }
  return [];
}

// /**
//  * /!\ works, but duplicate
//   Retrieves the leaf node from a cascading (one parent - one child) hierarchical tree node.
//  *
//   @param {Object} node - The root node of the tree.
//   @returns {Object} - The leaf node of the tree.
//  *
//   @throws {TypeError} - If `node` is not an object.
//  */
// function getLeafInCascading(node) {
//   if (typeOf(node) !== "Object") {
//     throw new TypeError(
//       `${getLeafInCascading.name} - Invalid input. Expected ${
//         arguments[0]
//       } to be a keyed Object. Instead, was passed ${typeOf(arguments[0])}`,
//     );
//   }
//   // check if cascading tree has more than one child
//   const vals = Object.values(node);
//   if (vals.length > 1) return node;

//   const val = vals.shift();
//   if (!val || typeOf(val) !== "Object") return node; // base case: child node can only be a keyed Object
//   return getLeafInCascading(val);
// }

/*
/!\ works, but the logic is flaud
*/
// function getLeafVals(node, mask) {
//   if (typeOf(node) !== "Object" || typeOf(mask) !== "Object") {
//     throw new TypeError(
//       `${getLeafVals.name} - Invalid input. Expected:
//       - ${arguments[0]} to be a keyed Object. Instead, was passed ${typeOf(
//         arguments[0],
//       )}
//       - ${arguments[1]} to be a keyed Object. Instead, was passed ${typeOf(
//         arguments[1],
//       )}`,
//     );
//   }
//   if (isEmptyObj(node) || isEmptyObj(mask)) {
//     return [];
//   }
//   const mask_keys = Object.keys(mask);
//   // check if all keys in `mask` match with the ones in `node`
//   if (!mask_keys.every((key) => Object.keys(node).includes(key))) {
//     return [];
//   }
//   return mask_keys.reduce((acc, key) => {
//     const node_val = node[key];
//     const mask_val = mask[key];
//     // check if the data type of the values in the mask,
//     // matches the data type of the values in the node
//     if (isJsonArray(mask_val)) {
//       // nesting level is an array of keyed objects
//       node_val.forEach((node) => {
//         // `acc` hoists the values of the leaf nodes
//         acc = acc.concat(getLeafVals(node, mask_val[0]));
//       });
//     } else if (typeOf(mask_val) === "Object") {
//       // nesting level is a keyed object
//       acc = acc.concat(getLeafVals(node_val, mask_val));
//     } else {
//       // it's presumed that both, `mask_val` and `node_val` are primitives
//       if (typeOf(mask_val) === typeOf(node_val)) {
//         if (
//           Array.isArray(mask_val)
//             ? mask_val.every((elm) => typeof elm !== "object")
//             : Object.values(mask).every((elm) => typeof elm !== "object")
//         ) {
//           // base case of the recursion is an Array of primitives
//           // OR a primitive
//           acc.push(node_val);
//         }
//       }
//     }
//     return acc;
//   }, []);
// }
