import param_validator from "../../../../classes/modules/param-validator.js";

export function isTaggedWith(node, path_to_tag_segments) {
  param_validator.validateKeyedObj(node);
  param_validator.validateArrayOfStrings(path_to_tag_segments);

  if (!path_to_tag_segments.length) {
    return false;
  }

  const [key, ...rest] = path_to_tag_segments.filter(Boolean);
  const has_key = Object.prototype.hasOwnProperty.call(node, key);
  if (!has_key || !rest.length) {
    // base case: tail end of the path reached OR key not found
    return has_key;
  }
  return isTaggedWith(node[key], rest);
}

// // usage:
// const node = {
//   x: {
//     b: {
//       c: "tagged",
//     },
//   },
// };
// const path = ["a", "b", "c"];
// const test0 = isTaggedWith(node, path);
// debugger;
