import { isEmptyObj } from "../../check/modules/is-empty-obj.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Removes duplicates in an array of objects based on one of its properties.
 * @param {Object[]} arr - An array of keyed Objects.
 * @param {string} key - The key against which to filter duplicates.
 * @returns {Object[]} - The filtered array without duplicates.
 */
export function filterDuplicatesBy(json_arr, key) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateString(key);

  if (!json_arr.length || key === "") {
    return [];
  }
  let prop_set = new Set();
  return json_arr.filter((obj) => {
    if (!(key in obj)) {
      // !Object.prototype.hasOwnProperty.call(obj, key)
      console.warn(`The key '${key}' does not exist in the Object:`, obj);
      return false;
    }
    return !prop_set.has(obj[key]) && prop_set.add(obj[key]);
  });
}

/**
 * @description Removes duplicates in an array of objects based on one of its properties using a Map.
 * @param {Object[]} arr - An array of keyed Objects.
 * @param {string} key - The key against which to filter duplicates.
 * @returns {Object[]} - The filtered array without duplicates.
 */
export function filterDuplicatesByMap(json_arr, key) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateString(key);

  if (!json_arr.length || key === "") {
    return [];
  }
  const data_map = new Map();
  json_arr.forEach((obj) => {
    if (typeof obj === "object" && key in obj) {
      data_map.set(obj[key], obj);
    }
  });
  return Array.from(data_map.values());
}

/**
 * @description Removes duplicates in an array of objects based on multiple keys.
 * @param {Array} json_arr - The input array.
 * @param {Array} keys - The keys against which to filter duplicates.
 * @returns {Array} - The filtered array without duplicates.
 */
export function filterDuplicatesByMultiProps(json_arr, keys) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateArrayOfStrings(keys);

  if (!json_arr.length || !keys.length) {
    return [];
  }
  const uniq_objs_map = new Map();

  json_arr.forEach((obj) => {
    // isolate ID keys into a new object that serves as a key for the Map()
    const curr_key = keys.reduce((acc, key) => {
      if (obj[key]) {
        acc[key] = obj[key];
      }
      return acc;
    }, {});

    // abort if `curr_key` is empty
    if (isEmptyObj(curr_key)) {
      return;
    }

    // check if a key exists in the Map() that shares at least one key with `curr_key`
    const existing_key = Array.from(uniq_objs_map.keys()).find((key) =>
      keys.some((key) => key[key] === curr_key[key]),
    );

    if (existing_key) {
      // merge eventual ID keys into `existing_key`
      Object.assign(
        existing_key,
        curr_key,
      ); /* mutates `existing_key` in place ByRef. Object is the only mutable value in JavaScript,
      which means their keys can be changed without changing their reference in memory.*/
      uniq_objs_map.get(existing_key).push(obj);
    } else {
      uniq_objs_map.set(curr_key, [obj]); // Map() stores a reference to both, `curr_key` and `obj`. So, either `obj` is modified, the changes will be reflected in the Map()
    }
  });

  // TODO - merge properties of the Array of Objects, into one Object
  // const result = Array.from(uniq_objs_map.values()).map((json_arr) => {
  //   return json_arr.reduce((acc, obj) => {
  //     return { ...acc, ...obj };
  //   }, {});

  // merge properties of the Array of Objects, into one Object
  const result = Array.from(uniq_objs_map.values()).map((json_arr) => {
    return json_arr.reduce((acc, obj) => {
      return { ...acc, ...obj };
    }, {});
  });

  return result;
}
