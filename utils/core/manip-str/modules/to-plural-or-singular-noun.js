import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @descriptionConverts a singular noun to its plural form.
 * @param {string} str - The singular noun to be converted.
 * @returns {string} The plural form of the input noun.
 */
export function toPluralNoun(str) {
  param_validator.validateString(str);

  if (!str.length) return str;
  return str.endsWith("y") ? str.replace(/y$/, "ies") : str.concat("s");
}

/**
 * @description Converts a plural noun to its singular form.
 * @param {string} str - The plural noun to be converted.
 * @returns {string} The singular form of the input noun.
 */
export function toSingularNoun(str) {
  param_validator.validateString(str);

  if (!str.length) return str;
  if (str.endsWith("ies")) {
    return str.replace(/ies$/, "y");
  } else if (str.endsWith("s")) {
    return str.slice(0, -1);
  }
  return str;
}
