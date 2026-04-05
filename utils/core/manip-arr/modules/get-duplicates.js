import param_validator from "../../../../classes/modules/param-validator.js";
/**
 * @description Finds and returns an array of duplicate values from the given array.
 * @param {Array} arr - The array to check for duplicate values.
 * @return {Array} An array containing the duplicate values found in the input array.
 */
export function getDuplicates(arr) {
  param_validator.validateArray(arr);
  if (!arr.length) return [];

  const seen = new Set();
  const duplicates = new Set();

  for (const value of arr) {
    if (seen.has(value)) {
      duplicates.add(value);
    } else {
      seen.add(value);
    }
  }
  return Array.from(duplicates);
}
