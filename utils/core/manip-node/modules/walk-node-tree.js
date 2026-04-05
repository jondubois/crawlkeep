import { typeOf } from "../../type-of.js";
import { isJsonArray } from "../../check/modules/is-json-array.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Performs a Depth-First Search traversal of a node tree using a stack.
 * @param {Object|Array} node - The node tree to traverse.
 */
export function walkNodeTree(node) {
  param_validator.validateKeyedObj(node);

  const stack = [node];
  const visited = new Set();

  while (stack.length > 0) {
    const current = stack.pop();

    // Skip if already visited
    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    const current_type = typeOf(current);

    // Handle Arrays
    if (current_type === "Array") {
      if (isJsonArray(current)) {
        // Push array items to stack in reverse order (for correct DFS order)
        for (let i = current.length - 1; i >= 0; i--) {
          stack.push(current[i]);
        }
      }
    }
    // Handle Objects
    else if (current_type === "Object") {
      Object.values(current).forEach((value) => {
        const value_type = typeOf(value);
        if (value_type === "Object" || value_type === "Array") {
          stack.push(value);
        }
      });
    }
  }
}
