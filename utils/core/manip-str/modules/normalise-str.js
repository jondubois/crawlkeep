import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Decomposes combined graphemes (e.g. acute accents) into their canonical characters by,
 * removing diacritic marks and converting it to lowercase.
 * @param {string} str - The input string to be normalized.
 * @returns {string} The normalized string.
 */
export function normaliseStr(str) {
  param_validator.validateString(str);
  // ternary operator would return `undefined` if `obj[prop]` is falsy
  if (!str) {
    return str;
  }
  return (
    str
      // Unicode Normalization Form D
      .normalize("NFD")
      // remove all diacritic marks
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
  );
}
