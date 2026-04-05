/**
 * Checks if a keyed object is empty (has no enumerable properties)
 * @param {*} obj - The object to check
 * @returns {boolean} - True if the object is empty or not an object, false otherwise
 */
export function isEmptyObj(obj) {
  // Check if obj is null, undefined, or not an object
  if (obj === null || typeof obj !== "object") {
    return true;
  }

  // Check if object has no enumerable properties
  return Object.keys(obj).length === 0;
}
