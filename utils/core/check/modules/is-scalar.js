/**
 * Checks if a value is a scalar (primitive) type.
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns true if the value is a scalar, false otherwise.
 */
export function isScalar(value) {
  return !(value instanceof Object) || value === null;
}
