import { isEmptyObj } from "../../check/modules/is-empty-obj.js";

import param_validator from "../../../../classes/modules/param-validator.js";
/**
 * @description Extracts top-level properties from a nested object based on user-defined keys.
 * If `is_excluded` is true, it removes the properties listed in `target_keys` from the cloned object.
 * Otherwise, it keeps only the properties listed in `target_keys`.
 * @param {Object} obj - The object to extract properties from.
 * @param {Array<string>} target_keys - The keys of the properties to extract or exclude from the output.
 * @param {boolean} [is_excluded=false] - Default behaviour is: only the properties in `target_keys` are included in the output.
 * If true, all the properties in `target_keys` form part of the output, except the ones in `target_keys`.
 * @returns {Object} - A new object with the extracted or excluded properties; or empty object if no match found.
 */
export function extractFromObjBy(obj, target_keys, is_excluded = false) {
  param_validator.validateKeyedObj(obj);
  param_validator.validateArrayOfStrings(target_keys);
  param_validator.warnArrOfEmptyStrings(target_keys);

  if (isEmptyObj(arguments[0]) || !arguments[1].length) {
    return obj;
  }

  const deep_clone = structuredClone(obj);

  Object.keys(deep_clone).forEach((key) => {
    if (
      (is_excluded && target_keys.includes(key)) ||
      (!is_excluded && !target_keys.includes(key))
    ) {
      delete deep_clone[key];
    }
  });
  return deep_clone;
}

// /**
//  * Creates a shallow copy of the object, only keeping the properties listed in `target_keys`.
//  *
//  * @param {Object} obj - The object to extract properties from.
//  * @param {Array<string>} target_keys - The keys of the properties to extract from the object.
//  * @returns {Object} - An object containing only the target properties.
//  */
// export function extractFromObjBy(obj, target_keys) {
//   if (typeOf(arguments[0]) !== "Object" || !Array.isArray(arguments[1])) {
//     throw new TypeError(
//       `${extractFromObjBy.name} - Invalid input. Expected:
//       - ${arguments[0]} to be a keyed Object. Instead, was passed ${typeOf(
//         arguments[0],
//       )}
//       - ${arguments[1]} to be an Array. Instead, was passed ${typeOf(
//         arguments[1],
//       )}`,
//     );
//   }
//   if (!arguments[1].length) {
//     return arguments[0];
//   }
//   if (isEmptyObj(arguments[0])) {
//     return arguments[0];
//   }
//   return target_keys.reduce((acc, key) => {
//     if (Object.prototype.hasOwnProperty.call(obj, key)) {
//       acc[key] = obj[key];
//     }
//     return acc;
//   }, {});
// }
