import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Sets the value of a property at a given path in an object.
 * @param {Object} node - The object in which to set the value.
 * @param {Array<string>} path_segments - An array of strings representing the path to the property.
 * @param {*} value - The value to set at the specified path.
 * @retruns {CascadingNodeTree} The object with the value set at the specified path.
 */
export function setNodeValueCascading(node, path_segments, value) {
  param_validator.validateKeyedObj(node);
  param_validator.validateArrayOfStrings(path_segments);
  param_validator.validateUndefined(value);

  // TODO - add a check for empty object
  //   if (isEmptyObj(arguments[0])) {
  //     // do something
  //   }
  if (!arguments[1].length) {
    return node;
  }

  const [key, ...rest] = path_segments;
  node[key] ??= {}; // nullish coalescing assignment
  if (rest.length > 0) {
    setNodeValueCascading(node[key], rest, value);
  } else {
    node[key] = value;
  }
  return node;
}
