import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Recursively aggregates key/value pairs from an object into a single object.
 * @param {Object} acc - The accumulator object.
 * @param {Object} obj - The object to aggregate.
 * @returns {Object} - The aggregated object.
 */
import { isEmptyArr, isJsonArray } from "../../check/index.js";
import { typeOf } from "../../type-of.js";

export function aggregateSample(acc, obj) {
  param_validator.validateKeyedObj(acc);
  param_validator.validateKeyedObj(obj);

  Object.entries(obj).forEach(([key, val]) => {
    if (!val) return; // skip falsy values, particularly `null`, which is of type "object"
    if (typeof val === "object") {
      // TODO - doesn't account for ofther Objects, like RegExp, Classes, Built-in Objects, etc.
      if (!isEmptyArr(val)) {
        if (isJsonArray(val)) {
          /* preserve the original array of keyed objects structure.
          On each iteration `acc[key]` is assigned an Array of single keyed aggregated Object.
          Thereby, when the next iteration brings in a new Array of keyed objects, it can be concatenated to the existing `acc[key]`,
          before reducing them into a single aggregated object, which is then enclosed in an Array. */
          // acc[key] = [
          //   (acc[key] || []).concat(val).reduce((a, o) => ({ ...a, ...o }), {}),
          // ];
          acc[key] = [
            (acc[key] || [])
              .concat(val)
              .reduce((a, o) => aggregateSample({ ...a }, o), {}),
          ];
        } else {
          // base case: `val` is an Array of primitives.
          acc[key] = val.slice(0, 1); // keeps only the first element as a sample, in a shallow copy
        }
      } else if (typeOf(val) === "Object") {
        // nesting level is a keyed object
        acc[key] = aggregateSample({ ...acc[key] }, val);
      } else if (val instanceof Date) {
        // base case: `val` is a Date object
        acc[key] = val;
      }
    } else {
      // base case: `val` is of primitive type
      acc[key] = val;
    }
  });
  return acc;
}
// usage: can be used as:
// let result = input_arr.reduce((acc, obj) => aggregateSample(acc, obj), {});
