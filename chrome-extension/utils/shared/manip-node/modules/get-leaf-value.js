import { typeOf } from "../../type-of.js";
import { isEmptyObj } from "../../check/modules/is-empty-obj.js";

/**
  @description traverses node tree from `root_node`, to retrieve the property value at the tail end of the path, which segments are stored in order in  `path_segments`
 *
  @param {Object} root_node - Root node.
  @param {string} path_segments - Segments that compose the path to the target nested value.
  @returns {*} - The value at the end of the path.
 */
export function getLeafValue(root_node, path_segments) {
  if (
    typeOf(arguments[0]) !== "Object" ||
    !Array.isArray(arguments[1]) ||
    !arguments[1].every((seg) => typeof seg === "string")
  ) {
    throw new TypeError(
      `${getLeafValue.name} - Invalid input. Expected:
        - ${arguments[0]} to be a keyed Object. Instead, was passed ${typeOf(
          arguments[0],
        )}
        - ${
          arguments[1]
        } to be an Array of String. Instead, was passed ${typeOf(
          arguments[1],
        )}`,
    );
  }
  if (isEmptyObj(arguments[0]) || !arguments[1].length) return root_node;
  return path_segments.reduce((acc, seg) => acc && acc[seg], root_node);
}
