import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description From a given node, construct / traverse cascading child nodes based on an array of path segments,
 * to set an empty keyed Object at the tail end of the path.
 * @typedef {Object} TreeNode
 * @property {TreeNode} [key] - A cascading node tree where every child node is a keyed Object.
 * @param {TreeNode} node - The tree node whom to add the new nested properties to.
 * @param {Array<string>} abs_path_segments - An array of path segments,
 * comprised of the keys of nested properties, ordered by successive degrees of nesting,
 * which represents the absolute path to the target property.
 * @returns {TreeNode} - The mutated in-place root node with the new nested properties. !! keep it (cf. addMetaTo) !!
 */
export function plantInNode(node, abs_path_segments) {
  param_validator.validateKeyedObj(node);
  param_validator.validateArrayOfStrings(abs_path_segments);
  param_validator.warnArrOfEmptyStrings(abs_path_segments);

  if (!abs_path_segments.length) {
    return node;
  }

  const [key, ...rest] = abs_path_segments;
  node[key] ??= {}; // nullish coalescing assignment
  plantInNode(node[key], rest);
  // base case
  return node;
}
