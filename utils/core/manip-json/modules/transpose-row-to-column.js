import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Transposes an array of keyed objects from row to column format.
 * @param {Array<Object>} json_arr an array of keyed objects
 * @returns {Array<Object>} an array of keyed objects
 */
export function transposeRowToColumn(json_arr) {
  param_validator.validateJsonArr(json_arr);

  return json_arr.reduce((acc, obj) => {
    Object.keys(obj).forEach((key) => {
      acc[key] = acc[key] || [];
      acc[key].push(obj[key]);
    });
    return acc;
  }, {}); // if `json_arr` is empty, then the initial value of the accumulator `{}` is returned as is
}
