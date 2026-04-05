import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * Checks if two arrays are equal by performing a shallow comparison of their elements.
 * https://github.com/riichard/boolean-parser-js/blob/master/README.md
 * @param {Array} arrA - The first array to compare.
 * @param {Array} arrB - The second array to compare.
 * @returns {boolean} - Returns true if the arrays are equal, false otherwise.
 * @throws {TypeError} - Throws a TypeError if either parameter is not an array.
 */
export function isEqualArrays(arrA, arrB) {
  param_validator.validateArray(arrA);
  param_validator.validateArray(arrB);

  if (arrA === arrB) return true;
  if (arrA.length !== arrB.length) return false;

  for (var i = 0; i < arrA.length; i++) {
    if (arrA[i] !== arrB[i]) {
      return false;
    }
  }
  return true;
}

export function isSameElm(arr1, arr2) {
  return arr1.filter((item) => !arr2.includes(item));
}
