import { typeOf } from "../../type-of.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Checks if a node tree is cascading.
 * @param {Object} root_node - The root node.
 * @returns {boolean} - Returns true if the tree is cascading, false otherwise.
 */
export function isCascading(root_node) {
  param_validator.validateKeyedObj(root_node);

  const stack = [root_node];

  while (stack.length > 0) {
    const curr_node = stack.pop();

    for (const val of Object.values(curr_node)) {
      if (typeOf(val) === "Object") {
        stack.push(val);
      } else if (typeOf(val) !== "Array") {
        return false;
      }
    }
  }
  return true;
}
