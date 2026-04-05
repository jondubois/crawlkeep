import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Creates a regular expression object based on the provided string and flag.
 * @param {string} str - The string to create the regular expression from.
 * @param {string} flag - The flag to be used for the regular expression.
 * @returns {RegExp|Error} - The regular expression object if successful, otherwise an Error object.
 */
export function tryRegExp(str, flag = "") {
  param_validator.validateString(str);
  param_validator.validateString(flag);

  if (!str) return /^$/;

  try {
    return new RegExp(str, flag);
  } catch (err) {
    try {
      return new RegExp(str.replace(/\W+/g, "\\W+?"), flag);
    } catch (rr) {
      // preserve stack trace whilst adding context
      rr.message = `Whilst processing ${tryRegExp.name} - Failed to convert to RegExp for input "${str}" and flag "${flag}": ${rr.message}`;
      throw rr;
    }
  }
}

// function tryRegExp(s, f) {
// try {
//   return new RegExp(s, f);
// } catch (err) {
//   try {
//     return new RegExp(s?.replace(/\W+/g, "\\W+?"), f);
//   } catch (rr) {
//     console.log(err, rr);
//     return /^$/;
//   }
// }
// }
