import { isScalar } from "./is-scalar.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * Checks if two arrays of scalar values are equal.
 * @param {Array} arr1 - The first array to compare.
 * @param {Array} arr2 - The second array to compare.
 * @returns {boolean} - Returns true if the arrays are equal, false otherwise.
 */
export function isEqualScalarArrays(arr1, arr2) {
  param_validator.validateArray(arr1);
  param_validator.validateArray(arr2);

  if (arr1 === arr2) return true; // Arrays are Objects, passed ByRef. If their references are the same, it's guaranteed they are equal.
  if (arr1.length !== arr2.length) return false;

  for (var i = 0, l = arr1.length; i < l; i++) {
    // check for eventual nested arrays, recursively
    if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
      if (!isEqualScalarArrays(arr1[i], arr2[i])) return false;
    } else if (
      !isScalar(arr1[i]) ||
      !isScalar(arr2[i]) ||
      arr1[i] !== arr2[i]
    ) {
      return false;
    }
  }
  return true;
}
