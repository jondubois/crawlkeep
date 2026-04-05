import { isEmptyObj } from "../../check/modules/is-empty-obj.js";
import { isEmptyArr } from "../../check/modules/is-empty-arr.js";
import { isKeyedObject } from "../../check/modules/is-keyed-obj.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Recursively applies a callback function to each value in a keyed object.
 * @param {Object} obj - The keyed object to recurse over.
 * @param {Function} callback - The callback function to apply to each value.
 * @returns {Object} - The modified object after applying the callback function.
 */
export function recurseOverKeyedObject(obj, callback) {
  param_validator.validateKeyedObj(obj);
  param_validator.validateFunction(callback);

  if (isEmptyObj(obj)) {
    return obj;
  }
  // create a copy of obj
  const obj_copy = { ...obj };

  // recurse on values that are Array of keyed Objects
  const recursed = Object.entries(obj).reduce((acc, [key, val]) => {
    if (!isEmptyArr(val) && val.every((item) => isKeyedObject(item))) {
      acc[key] = val.map((o) => callback(o));
      delete obj_copy[key];
    } else {
      Object.assign(acc, callback({ [key]: val }));
    }
    return acc;
  }, {});

  return {
    ...obj_copy,
    ...recursed,
  };
}
