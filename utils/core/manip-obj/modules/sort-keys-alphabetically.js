import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Sorts the keys of a keyed Object in alphabetical order.
 * @param {Object} obj - The object to sort.
 * @returns {Object} - The object with keys sorted in alphabetical order.
 */
export function sortKeysAlphabetically(obj) {
  param_validator.validateKeyedObj(obj);
  // if `obj` is empty, then returns the accumulator i.e. `{}`
  return (
    Object.keys(obj)
      .sort()
      // map() processes the keys in the order they appear in the array
      .map((key) => ({ [key]: obj[key] }))
      // reduce() processes the elements of the array in order they appear
      .reduce((acc, curr) => Object.assign(acc, curr), {})
  );
}

/**
 * @description Sorts the keys of a keyed Object in alphabetical order and returns a new Object.
 * @param {Object} obj - The object to sort.
 * @returns {Object} - A new object with keys sorted in alphabetical order.
 */
export function sortKeysAlphabetically1(obj) {
  param_validator.validateKeyedObj(obj);

  // Map() object preserves the order of the key-value pairs
  let ordered = new Map();
  Object.keys(obj)
    .sort()
    .forEach(function (key) {
      ordered.set(key, obj[key]);
    });

  let ordered_obj = {};
  for (let [key, value] of ordered) {
    ordered_obj[key] = value;
  }
  return ordered_obj;
}
