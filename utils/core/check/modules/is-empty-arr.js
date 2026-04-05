/**
 * check if an array is empty
 * @param {Array} arr array to check for emptiness
 * @returns {boolean} true if the array is empty
 */
export function isEmptyArr(arr) {
  return (
    !Array.isArray(arr) ||
    // typeof arr !== "undefined" && // redundant
    // arr !== null && // redundant
    // arr.length !== null &&  // unnecessary because the length of an array is never null
    // arr.length === 0 && // redundant
    !arr.length
  ); // if arr.length is 0, or false, it returns true https://www.freecodecamp.org/news/check-if-javascript-array-is-empty-or-not-with-length/
}
// /!\ doesn't account for Array of empty strings
