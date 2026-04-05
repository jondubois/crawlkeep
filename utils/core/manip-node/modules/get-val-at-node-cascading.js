import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description traverses node tree from `root_node`, to retrieve the property value at the tail end of the path,
 * which segments are stored in order in  `abs_path_segments`.
 * @requires node tree to be a cascading node, where every child node is a keyed Object.
 * /!\ It's meant to apply to nested objects with a keyed Object as values (not primitives, Array, etc)
 * @param {Object} root_node - Root node.
 * @param {string[]} abs_path_segments - Segments that compose the path to the target nested value.
 * @returns {*} - The value at the end of the path. Returns `undefined` if not found, or the path does not exist.
 */
export function getValAtNodeCascading(root_node, abs_path_segments) {
  param_validator.validateKeyedObj(arguments[0]);
  param_validator.validateArrayOfStrings(arguments[1]);

  abs_path_segments = abs_path_segments.filter(Boolean);
  if (!abs_path_segments.length) return root_node;

  return abs_path_segments.reduce(
    (acc, seg) => acc && acc[seg],
    root_node,
  ); /* Short-Circuiting:
  The && operator ensures that if `acc` is ever falsy, the entire expression evaluates to `undefined` for subsequent iterations.
  This means that if any segment in the path does not exist, the function will return `undefined` */
}
