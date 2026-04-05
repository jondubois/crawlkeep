/**
 * check if source array is a valid JSON structure
 * @param {Array} arr_source array to verify
 * @returns {boolean}
 */
function isJSONstructure(arr_source) {
  return arr_source.every((elm) => {
    return typeof elm === "object"
      ? Object.keys(elm).every((key) => {
          return Array.isArray(elm[key])
            ? true
            : console.log(`${key} is not an array`);
        })
      : console.log(`${elm} is not an object`);
  });
}
export { isJSONstructure };

import { typeOf } from "../../type-of.js";

export function isJsonArray(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError(
      `isJsonArray: invalid input. Expected ${arr} to be an Array. Instead, was passed ${typeOf(
        arr,
      )}`,
    );
  }
  return (
    arr.length > 0 && arr.every((item) => typeOf(item) === "Object")
  ); /*  if `arr.length` is 0 (a falsy value), the logical `AND` operator short-circuits
    and returns 0 without evaluating the right-hand side (arr.every(...)) (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND#short-circuit_evaluation)*/
}
