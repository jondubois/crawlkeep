import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * Checks if two objects are partially equal ie.
 * they have the exact same properties with the same values, regardless of their memory reference
 *
 * @param {Object} obj1 - The first object to compare.
 * @param {Object} obj2 - The second object to compare.
 * @returns {boolean} - Returns true if the objects are partially equal, false otherwise.
 * @throws {TypeError} - Throws a TypeError if either obj1 or obj2 is not an object.
 *
 * @example
 * const objA = { a: 1, b: 2, c: 3 };
 * const objB = { a: 1, b: 2, c: 3 };
 * const objC = { a: 1, b: 2, d: 4 };
 *
 * console.log(isPartiallyEqualObjs(objA, objB)); // true
 * console.log(isPartiallyEqualObjs(objA, objC)); // false
 */

export function isPartiallyEqualObjs(obj1, obj2) {
  param_validator.validateKeyedObj(obj1);
  param_validator.validateKeyedObj(obj2);

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (
      !Object.prototype.hasOwnProperty.call(obj2, key) ||
      obj1[key] !== obj2[key]
    ) {
      return false;
    }
  }

  return true;
}
