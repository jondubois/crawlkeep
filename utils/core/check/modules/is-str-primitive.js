/**
 * Checks if a value is a string.
 * https://stackoverflow.com/questions/4059147/check-if-a-variable-is-a-string-in-javascript
 * @param {any} str - The value to be checked.
 * @returns {boolean} - Returns true if the value is a string, otherwise returns false.
 */
export function isStringPrimitive(str) {
  if (typeof str !== "string" || !(str instanceof String)) {
    return false;
  }
  return true;
}
