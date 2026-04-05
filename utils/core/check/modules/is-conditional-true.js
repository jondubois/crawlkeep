import { isEmptyArr } from "./is-empty-arr.js";
import { isEmptyObj } from "./is-empty-obj.js";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * Filter JSON object based on a condition over a nested property
 * @param {object} obj the JSON parent object to search
 * @param {string} prop the property of the parent object that contains an array of objects, where the condition is
 * @param {string} key the property to search
 * @param {string} val the value of the condition
 * @returns {boolean} check whether the conditional was found
 */
export function isConditionalTrue(obj, prop, key, val) {
  param_validator.validateKeyedObj(obj);
  param_validator.validateString(prop);
  param_validator.validateString(key);
  param_validator.validateString(val);

  if (isEmptyObj(obj)) {
    return false;
  }
  // we need two returns:
  // - one to satisfy the condition of the below filter(), so it returns what eventually matched the condition
  // - the other to satisfy the condition of the parent filter()
  let arr_res = obj[prop].filter((elm) => {
    return elm[key] === val;
  });
  return !isEmptyArr(arr_res);
}
