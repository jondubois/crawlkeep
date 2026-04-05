import { typeOf } from "../../type-of.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Flattens a nested JSON object into a flat structure with dot-separated keys
 * A single-level object allows for O(1) time complexity for lookups.
 * @param {Object} obj - The JSON object to be flattened.
 * @param {string} [prefix=""] - The prefix to be added to the flattened keys.
 * @returns {Object} - The flattened JSON object.
 * @example
 * const data = {
 *   tags: {
 *     inherent: {
 *       job_description: {
 *         middle_management: {
 *           low: "middle_management,low",
 *         },
 *       },
 *     },
 *     inferred: {},
 *   },
 * };
 * const flattened_data = toFlatJson(data);
 * expected output:
 * {
 *   "tags.inherent.job_description.middle_management.low": "middle_management,low"
 * }
 */
export function toFlatJson(obj, prefix = "") {
  param_validator.validateKeyedObj(obj);
  param_validator.validateString(prefix);
  const flattened_json = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const new_key = prefix ? `${prefix}.${key}` : key;
      if (typeOf(obj[key]) === "Object") {
        Object.assign(flattened_json, toFlatJson(obj[key], new_key));
      } else {
        flattened_json[new_key] = obj[key];
      }
    }
  }
  return flattened_json;
}
