import { typeOf } from "../../type-of.js";
/**
 * Checks if an object is empty by iterating over its own properties (not those inherited from its prototype).
 * @param {Object} obj - The object to be checked.
 * @returns {boolean} - Returns true if the object is empty, otherwise returns false.
 */
// https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
export function isEmptyObj(obj) {
  if (typeOf(obj) !== "Object") {
    throw new TypeError(
      `${
        isEmptyObj.name
      } - Invalid input. Expected ${obj} to be a keyed Object. Instead, was passed ${typeOf(
        arguments[0],
      )}`,
    );
  }
  for (let key in obj) {
    // for compatibility with JavaScript engines that don’t support ES 2022+,
    // obj.hasOwnProperty() was replaced with Object.prototype.hasOwnProperty.call()
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // property is found, return false
      return false;
    }
  }
  return true;
}
