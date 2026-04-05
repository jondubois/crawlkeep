import { isEmptyObj } from "./is-empty-obj.js";
import { isJsonArray } from "./is-json-array.js";
import { typeOf } from "../../type-of.js";

import param_validator from "../../../../classes/modules/param-validator.js";
/**
 * Checks if a given node matches a mask.
 * TODO: Depth-first search https://en.wikipedia.org/wiki/Depth-first_search vs Breadth-first search https://en.wikipedia.org/wiki/Breadth-first_search
 * @param {Object} node - The node to check.
 * @param {Object} mask - The mask to match against.
 * @returns {boolean} - Returns true if the node matches the mask, false otherwise.
 * @throws {Error} - Throws an error if the input is invalid.
 */
export function isFoundIn(node, mask) {
  if (typeof node !== "object") {
    throw new TypeError(
      `isFoundIn - Invalid input. Expected ${node} to be an indexed or keyed collection. Instead, got ${typeof node}`,
    );
  }
  param_validator.validateKeyedObj(mask);

  if (isEmptyObj(node) || isEmptyObj(mask)) {
    return false;
  }
  const mask_keys = Object.keys(mask);
  // check if all keys in `mask` match with the ones in `node`
  if (!mask_keys.every((key) => key in node)) {
    return false;
  } // Object.keys(node).includes(key)
  return mask_keys.every((key) => {
    const node_val = node[key];
    const mask_val = mask[key];
    // check if the data type of the values in the mask,
    // matches the data type of the values in the node
    if (isJsonArray(mask_val)) {
      // `mask_val` is an array of keyed objects
      return node_val.some((node) => isFoundIn(node, mask_val[0]));
    } else if (typeOf(mask_val) === "Object") {
      // `mask_val` is a keyed object
      return isFoundIn(node_val, mask_val);
    } else {
      return typeOf(mask_val) === typeOf(node_val);
    }
  });
}

// // usage
// try {
//   // in JavaScript, Arrays are of type Object
//   if (Array.isArray(nested_obj)) {
//     // recursively traverse sub nodes for match
//     return nested_obj.filter((node) => isFoundIn(node, mask));
//   } else {
//     // root node is a flat keyed collection
//     return isFoundIn(nested_obj, mask) ? [nested_obj] : [];
//   }
// } catch (error) {
//   console.error(error);
// }
