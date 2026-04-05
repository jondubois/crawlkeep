import { toSingularNoun } from "../../manip-str/modules/to-plural-or-singular-noun.js";
import { isEmptyObj } from "../../check/modules/is-empty-obj.js";

import param_validator from "../../../../classes/modules/param-validator.js";

// TODO - Refactor, so for each property where the value is a JSON Array,
// it captures the key > to singular > ensure the singular key is prepended to all keys of each Object in the JSON Array
/**
 * @description Converts the properties of an object to categorised props based on a parent key.
 * @param {Object} obj - The object to convert.
 * @param {string} parent_key - The parent key used for categorisation.
 * @returns {Object} - The object with categorised properties.
 */
export function toStandardisedProps(obj, parent_key) {
  param_validator.validateKeyedObj(obj);
  param_validator.validateString(parent_key);

  if (isEmptyObj(obj) || !parent_key.length) {
    return obj;
  }

  // for properties that can be categorised,
  let replacement_key;
  let singular = toSingularNoun(parent_key);
  const rx = new RegExp(`(^${singular}|^${parent_key})(?=_)`, "i");
  return Object.keys(obj).reduce((acc, key) => {
    if (!rx.test(key)) {
      // pre-pend the `parent_key` to the key
      replacement_key = `${singular}_${key}`; // key.replace("", `${singular}_`) https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#description
    } else {
      // ensure the `parent_key` is singular
      replacement_key = key.replace(rx, singular);
    }
    acc[replacement_key] = obj[key];
    return acc;
  }, {});
}

// const rx = new RegExp(`^(${singular})_|^(${parent_key})_`, "i");
// let replacement_key = key.replace(rx, (match, p1, p2) => {
//   return match.replace(p1 || p2, singular);
// });
// OR
// return Object.keys(obj).reduce((acc, key) => {
//   let replacement_key = key.replace(rx, (match, p1, p2) => {
//     return singular + "$'";  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_the_replacement
//   });
