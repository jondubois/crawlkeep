import { typeOf } from "../../type-of.js";

/**
 * Checks if an object is empty by iterating over its own properties (not those inherited from its prototype).
 * @param {Object} obj - The object to be checked.
 * @returns {boolean} - Returns true if the object is empty, otherwise returns false.
 */
// https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
export function isEmptyObj(obj) {
  /* param_validator.validateKeyedObj(obj); /!\ DO NOT import ParamValidator.
  Orelse, it'd create a circular dependency */
  if (typeOf(obj) !== "Object") {
    throw new TypeError(
      `Invalid data type. Expected ${obj} to be a keyed Object. Instead, was passed ${typeOf(
        obj,
      )}`,
    );
  }

  for (let key in obj) {
    /* for compatibility with JavaScript engines that don’t support ES 2022+,
    obj.hasOwnProperty() was replaced with Object.prototype.hasOwnProperty.call() */
    /* terates over all enumerable properties.
    Only own properties are considered, explicitly ignoring inherited properties. */
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // property is found, return false
      return false;
    }
  }
  return true;
}
// Object.keys(child).length > 0
