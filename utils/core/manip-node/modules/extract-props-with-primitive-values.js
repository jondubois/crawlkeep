import { typeOf } from "../../type-of.js";
import { isJsonArray } from "../../check/modules/is-json-array.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Checks if a value is a primitive type.
 * @param {*} value - The value to check.
 * @returns {boolean} - True if the value is a primitive, false otherwise.
 */
function isPrimitiveType(value) {
  const value_type = typeof value;
  return (
    value_type === "string" ||
    value_type === "number" ||
    value_type === "boolean" ||
    value_type === "bigint" ||
    value_type === "symbol" ||
    value_type === "undefined" ||
    value === null
  );
}

/**
 * @description Extracts properties with primitive values of a specific type from a node tree.
 * iterative DFS Traversal
 * @param {Object|Array} node - The node tree to traverse.
 * @param {string} [primitive_type="string"] - The primitive type to extract ("string", "number", "boolean", "bigint", "symbol", "undefined", "null").
 * @returns {Object} - Flattened object with all primitive values of the specified type keyed by their path.
 * @example
 * // Input: { skills: [{ name: "JS", years: 5 }], active: true }, "string"
 * // Output: { "skills[0].name": "JS" }
 */
export function extractPropsWithPrimitiveValuesWithDotNotationPath(
  node,
  primitive_type = "string",
) {
  if (typeOf(node) === "Array") {
    param_validator.validateJsonArr(node);
  } else {
    param_validator.validateKeyedObj(node);
  }
  param_validator.validateString(primitive_type);

  // Validate that primitive_type is one of the valid primitive type names
  const valid_primitive_types = [
    "string",
    "number",
    "boolean",
    "bigint",
    "symbol",
    "undefined",
    "null",
  ];
  if (!valid_primitive_types.includes(primitive_type.toLowerCase())) {
    throw new TypeError(
      `Invalid primitive_type "${primitive_type}". Expected one of: ${valid_primitive_types.join(", ")}`,
    );
  }

  const result = {};
  const stack = [{ node, path: "" }];
  const visited = new Set();

  while (stack.length > 0) {
    const { node: current, path } = stack.pop();

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
          const item_path = path ? `${path}[${i}]` : `[${i}]`;
          stack.push({ node: current[i], path: item_path });
        }
      }
    }
    // Handle Objects
    else if (current_type === "Object") {
      Object.entries(current).forEach(([key, value]) => {
        const value_type = typeOf(value);
        const current_path = path ? `${path}.${key}` : key;

        if (value_type === "Object" || value_type === "Array") {
          stack.push({ node: value, path: current_path });
        } else if (isPrimitiveType(value) && typeof value === primitive_type) {
          // Store primitive value that matches the type
          result[current_path] = value;
        }
      });
    }
  }

  return result;
}

/**
 * @description Extracts properties with primitive values of a specific type from a node tree.
 * iterative DFS Traversal
 * @param {Object|Array} node - The node tree to traverse.
 * @param {string} [primitive_type="string"] - The primitive type to extract ("string", "number", "boolean", "bigint", "symbol", "undefined", "null").
 * @returns {Object} - Flattened object with all primitive values of the specified type (without paths).
 * @example
 * // Input: { person: { skills: [{ name: "JS", years: 5 }] } }, "string"
 * // Output: { name: "JS" }
 */
function extractPropsWithPrimitiveValues(node, primitive_type = "string") {
  param_validator.validateKeyedObj(node);
  param_validator.validateString(primitive_type);

  // Validate that primitive_type is one of the valid primitive type names
  const valid_primitive_types = [
    "string",
    "number",
    "boolean",
    "bigint",
    "symbol",
    "undefined",
    "null",
  ];
  if (!valid_primitive_types.includes(primitive_type.toLowerCase())) {
    throw new TypeError(
      `Invalid primitive_type "${primitive_type}". Expected one of: ${valid_primitive_types.join(", ")}`,
    );
  }

  const result = {};
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

    if (current_type === "Array") {
      if (isJsonArray(current)) {
        // Push array items to stack in reverse order (for correct DFS order)
        for (let i = current.length - 1; i >= 0; i--) {
          stack.push(current[i]);
        }
      }
    } else if (current_type === "Object") {
      Object.entries(current).forEach(([key, value]) => {
        const value_type = typeOf(value);

        if (value_type === "Object" || value_type === "Array") {
          stack.push(value);
        } else if (isPrimitiveType(value) && typeof value === primitive_type) {
          // Store primitive value that matches the type
          result[key] = value;
        }
      });
    }
  }
  return result;
}
