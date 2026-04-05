import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Generates all permutations of the elements of an array.
 * @requires every element of the array to be of fundamental data type.
 * @param {Array} arr - The input array.
 * @returns {Array} - An array containing all permutations of the input array.
 */
export function permutate(arr) {
  param_validator.validateArray(arr);
  param_validator.validateArrayOfFundamentals(arr);

  if (!arr.length) {
    return [];
  }

  if (arr.length === 1) {
    // base case for recursion
    return [arr];
  }

  return arr.reduce((result, value, index) => {
    const remainingElements = [...arr.slice(0, index), ...arr.slice(index + 1)];
    const permutationsOfRemaining = permutate(remainingElements).map(
      (permutation) => [value, ...permutation],
    );
    return [...result, ...permutationsOfRemaining];
  }, []);
}
