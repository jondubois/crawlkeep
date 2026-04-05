import { typeOf } from "../../type-of.js";
import { intersection } from "../../manip-arr/modules/superpose-arr.js";
import { isEmptyObj } from "../../check/modules/is-empty-obj.js";

import param_validator from "../../../../classes/modules/param-validator.js";
/**
 * @description Traverses two objects and returns an array of common keys.
 * @param {Object} obj1 - The first object to compare.
 * @param {Object} obj2 - The second object to compare.
 * @returns {Array} - An array of common keys between the two objects.
 * @example
 * const data = {
 *   tags: {
 *     inherent: {
 *       job_description: {
 *         middle_management: {
 *           low: true,
 *         },
 *       },
 *       job_title: {
 *         middle_management: {
 *           low: true,
 *         },
 *         hardware_engineering: true,
 *       },
 *     },
 *     inferred: {},
 *   },
 * };
 * const jd_tags = data.tags.inherent.job_description;
 * const jt_tags = data.tags.inherent.job_title;
 *
 * getCommonKeys(jd_tags, jt_tags);
 * // expected result: ["middle_management"]
 */
export function getCommonKeysToArr(obj1, obj2) {
  param_validator.validateKeyedObj(obj1);
  param_validator.validateKeyedObj(obj2);

  const common_tags = [];
  _traverseKeys(obj1, obj2, common_tags);
  return common_tags;
}

function _traverseKeys(o1, o2, common_tags) {
  if (typeOf(o1) !== "Object" || typeOf(o2) !== "Object") {
    return;
  }

  for (const key in o1) {
    if (
      Object.prototype.hasOwnProperty.call(o1, key) &&
      Object.prototype.hasOwnProperty.call(o2, key)
    ) {
      common_tags.push(key);
      _traverseKeys(o1[key], o2[key], common_tags);
    }
  }
}

/**
 * @description Finds common keys between two objects and returns them as a nested object.
 * @param {Object} obj1 - The first object.
 * @param {Object} obj2 - The second object.
 * @returns {Object} - A nested object of common keys.
 */
export function getCommonKeysToObj(obj1, obj2) {
  param_validator.validateKeyedObj(obj1);
  param_validator.validateKeyedObj(obj2);

  const common_keys = {};
  _traverseKeys1(obj1, obj2, common_keys);
  return common_keys;
}

function _traverseKeys1(o1, o2, common_keys) {
  if (typeOf(o1) !== "Object" || typeOf(o2) !== "Object") {
    return;
  }

  for (const key in o1) {
    if (
      Object.prototype.hasOwnProperty.call(o1, key) &&
      Object.prototype.hasOwnProperty.call(o2, key)
    ) {
      common_keys[key] = {};
      _traverseKeys1(o1[key], o2[key], common_keys[key]);
    }
  }
}

/**
 * @description Gets the keys common to two objects in an array.
 * @param {Object} obj1 - The first object to compare.
 * @param {Object} obj2 - The second object to compare.
 * @returns {Array} - An array of common keys between the two objects.
 * @example
 * const data = {
 *   tags: {
 *     inherent: {
 *       job_description: {
 *         middle_management: {
 *           low: true,
 *         },
 *       },
 *       job_title: {
 *         middle_management: {
 *           low: true,
 *         },
 *         hardware_engineering: true,
 *       },
 *     },
 *     inferred: {},
 *   },
 * };
 * const jd_tags = data.tags.inherent.job_description;
 * const jt_tags = data.tags.inherent.job_title;
 *
 * getCommonKeys(jd_tags, jt_tags);
 * // expected result: ["middle_management"]
 */
export function getCommonKeys(obj1, obj2) {
  param_validator.validateKeyedObj(obj1);
  param_validator.validateKeyedObj(obj2);

  if (isEmptyObj(arguments[0]) || isEmptyObj(arguments[1])) {
    // nothing in common
    return [];
  }
  return intersection(Object.keys(obj1), Object.keys(obj2));
}

/**
 * @description Compares the values in obj1 and obj2 and returns an array of common values.
 * @param {Object} obj1 - The first object.
 * @param {Object} obj2 - The second object.
 * @returns {Array} - An array containing the common values of obj1 and obj2.
 */
export function getCommonValues(obj1, obj2) {
  param_validator.validateKeyedObj(obj1);
  param_validator.validateKeyedObj(obj2);

  if (isEmptyObj(arguments[0]) || isEmptyObj(arguments[1])) {
    // nothing in common
    return [];
  }

  return intersection(Object.values(obj1), Object.values(obj2));
}

/**
 * @description Compares the values in obj1 and obj2 and returns an indexed object aka
 * object with numeric keys aka indexed collection of integer-keyed properties
 * of common values.
 * @param {Object} obj1 - Keyed object.
 * @param {Object} obj2 - Keyed object.
 * @returns {Object} - An indexed object containing the common values of `obj1` and `obj2`.
 */
export function getCommonValuesIndexed(obj1, obj2) {
  param_validator.validateKeyedObj(obj1);
  param_validator.validateKeyedObj(obj2);

  if (isEmptyObj(arguments[0]) || isEmptyObj(arguments[1])) {
    // nothing in common
    return {};
  }

  return Object.assign({}, getCommonValues(obj1, obj2)); // returns empty object if no common values ie. `getCommonValues(obj1, obj2)` is an empty array
}
