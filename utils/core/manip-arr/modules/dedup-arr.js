import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Removes duplicate elements from an array.
 * @param {Array} arr - The input array.
 * @returns {Array} - The array with duplicate elements removed.
 */
export function deDupArr(arr) {
  param_validator.validateArray(arr);

  return Array.from(new Set(arr));
}
