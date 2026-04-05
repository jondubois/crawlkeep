import param_validator from "../../../../classes/modules/param-validator.js";
/**
 * @description dedpulicate an array of Objects, based on a specified key
 * @param {Array<Object>} json_arr - array of Objects to filter
 * @param {String} key - key to determine uniqueness
 * @param {Boolean} keep_existing - If true, keeps the existing record; if false, the last duplicate supersedes.
 * @return {Array<Object>} - The array of unique objects.
 */
export function unqKey(json_arr, key, keep_existing = false) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateString(key);
  param_validator.validateBoolean(keep_existing);

  const map = new Map();
  for (const obj of json_arr) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) continue;
    if (keep_existing) {
      // keep existing, drop new duplicates
      if (!map.has(obj[key])) {
        map.set(obj[key], obj);
      }
    } else {
      // last duplicate supersedes
      map.set(obj[key], obj);
    }
  }
  return Array.from(map.values());
}
