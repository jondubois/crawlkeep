import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Filters an array of objects based on any one of an array of properties.
 * @param {Object[]} json_arr - The array of objects to filter.
 * @param {string[]} keys - The target properties to filter by.
 * @returns {Object[]} - The filtered array of objects.
 */
export function filterByAnyProps(json_arr, keys) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateArrayOfStringsIsNotEmpty(keys);

  if (!json_arr.length || !keys.length) {
    return json_arr;
  }
  return json_arr.filter(
    (obj) =>
      obj &&
      typeof obj === "object" &&
      keys.some((prop) => Object.prototype.hasOwnProperty.call(obj, prop)),
  );
}

/**
 * Filters an array of objects based on every properties.
 *
 * @param {Object[]} json_arr - The array of objects to filter.
 * @param {string[]} keys - The target properties to filter by.
 * @returns {Object[]} - The filtered array of objects.
 */
export function filterByEveryProps(json_arr, keys) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateArrayOfStringsIsNotEmpty(keys);

  if (!json_arr.length || !keys.length) {
    return json_arr;
  }
  return json_arr.filter(
    (obj) =>
      obj &&
      typeof obj === "object" &&
      keys.every((prop) => Object.prototype.hasOwnProperty.call(obj, prop)),
  );
}
