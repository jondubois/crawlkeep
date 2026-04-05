import { isEmptyObj } from "../../check/modules/is-empty-obj.js";

import param_validator from "../../../../classes/modules/param-validator.js";
/**
 * @description Merges two arrays of objects, based on a common key.
 * Includes elements from both `json_arr1` and `json_arr2`, ensuring all unique keys are represented in the result.
 * In case objects share common properties, the values from `json_arr2` will overwrite the values from `json_arr1`.
 * @param {Object[]} json_arr1 - The first array of objects.
 * @param {Object[]} json_arr2 - The second array of objects.
 * @param {string} common_key - The common key to merge the arrays on.
 * @returns {Object[]} - The merged array of JSON objects.
 * @example
 * const json_arr1 = [
 *   { id: 1, name: "Alice" },
 *   { id: 2, name: "Bob" }
 * ];
 * const json_arr2 = [
 *   { id: 1, age: 25 },
 *   { id: 3, name: "Charlie" }
 * ];
 * mergeJsonArraysBy(json_arr1, json_arr2, "id");
 * Expected output:
 * [
  { id: 1, name: "Alice", age: 25 },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" }
   ]
 */
export function mergeJsonArraysBy(json_arr1, json_arr2, common_key) {
  param_validator.validateJsonArr(json_arr1);
  param_validator.validateJsonArr(json_arr2);
  param_validator.validateString(common_key);

  if (isEmptyObj(json_arr1) || isEmptyObj(json_arr2) || !common_key) {
    return {};
  }
  // Create Maps from the arrays using the value in `obj[common_key]` as a unique key
  const map1 = new Map(json_arr1.map((obj) => [obj[common_key], obj]));
  const map2 = new Map(json_arr2.map((obj) => [obj[common_key], obj]));

  const uniq_shared_keys = new Set([...map1.keys(), ...map2.keys()]);

  // the unique key becomes a pivot in merging corresponding values in each object
  return [...uniq_shared_keys].map((key) => ({
    ...map1.get(key),
    ...map2.get(key),
  }));
} // time complexity is: O(n) + O(m) + O(n + m) + O(n + m) = O(n + m),
// where (n) is the length of `json_arr1` and (m) is the length of `json_arr2`.

/**
 * @description Merges two JSON arrays based on a common property name.
 * @param {Array} json_arr1 - The first JSON array to merge.
 * @param {Array} json_arr2 - The second JSON array to merge.
 * @param {string} common_key - The property name used for merging.
 * @returns {Array} - A merged array of objects.
 * @example
 * const json_arr1 = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
 * const json_arr2 = [{ id: 1, age: 25 }, { id: 3, name: "Charlie" }];
 * const merged = mergeJsonArraysBy(json_arr1, json_arr2, "id");
 *
 * @todo /!\ Not yet tested
 */
import { intersection } from "../../manip-arr/index.js";

function mergeJsonArraysBy1(json_arr1, json_arr2, common_key) {
  param_validator.validateJsonArr(json_arr1);
  param_validator.validateJsonArr(json_arr2);
  param_validator.validateString(common_key);

  const map1 = new Map(json_arr1.map((item) => [item[common_key], item]));
  const map2 = new Map(json_arr2.map((item) => [item[common_key], item]));

  const keys1 = Array.from(map1.keys());
  const keys2 = Array.from(map2.keys());

  const matching_keys = intersection(keys1, keys2);

  const merged_items = matching_keys.map((key) => ({
    ...map2.get(key),
    ...map1.get(key),
  }));

  // for items that don't have a matching key in json_arr1
  const non_matching_items = keys2
    .filter((key) => !map1.has(key))
    .map((key) => map2.get(key));

  return [...merged_items, ...non_matching_items];
} // time complexity is: O(n) + O(m) + O(n) + O(m) + O(n + m) + O(\min(n, m)) + O(m) + O(m) + O(n + m) = O(n + m)
// where (n) is the length of json_arr1 and (m) is the length of json_arr2.
