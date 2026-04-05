import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Format an object into an array of JSON objects.
 * @param {object} obj object to format into JSON array
 * @returns {Array} array of JSON objects
 */
export function formatObjIntoJSONarr(obj) {
  param_validator.validateKeyedObj(obj);
  return Object.keys(obj).reduce((acc, key) => {
    acc.push({ [key]: obj[key] });
    return acc;
  }, []);
}
