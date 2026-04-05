import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Extracts data from an array of objects based on a specified key and sub-key's value,
 * then exhaustively list all properties of the parent object for all matches.
 * Does not mutate the source array.
 * @param {Object[]} json_arr - The source array of Objects.
 * @param {string} key - The target key.
 * @param {string} sub_key - Within the target key, the sub-key upon which is based the condition.
 * @param {any} value - The condition against which filter the sub-key.
 * @returns {Object[]} payload_arr - An array containing the extracted data objects.
 */
export function extractBySubPropValPair(json_arr, key, sub_key, value) {
  param_validator.validateJsonArr(json_arr);
  param_validator.validateString(key);
  param_validator.validateString(sub_key);
  param_validator.validateUndefined(value);

  return json_arr.reduce((acc, obj) => {
    const obj_copy = { ...obj };
    const sub_props = obj[key].filter((sub_obj) => sub_obj[sub_key] === value);
    // replace the target key by a breakdown of the targetted information and,
    // duplicate the rest of the object around each occurence
    if (sub_props.length > 0) {
      delete obj_copy[key];
      sub_props.forEach((obj_elm) => acc.push({ ...obj_copy, ...obj_elm }));
    }
    return acc;
  }, []);
}
