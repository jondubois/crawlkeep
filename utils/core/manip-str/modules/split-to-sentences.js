import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Splits a string into an array of sentences.
 * @param {string} str - The input string to be split.
 * @returns {string[]} - An array of sentences.
 */
export function splitToSentences(str) {
  param_validator.validateString(str);

  if (!str) {
    return str;
  }

  const dash_chars = [
    "\u002D", // Hyphen-Minus (-)
    "\u2010", // Hyphen (‐)
    "\u2011", // Non-Breaking Hyphen (‑)
    "\u2012", // Figure Dash (‒)
    "\u2013", // En Dash (–)
    "\u2014", // Em Dash (—)
    "\u2015", // Horizontal Bar (―)
    "\u2212", // Minus Sign (−)
  ];
  let dash_pattern = `\\s+(?:${dash_chars.join("|")})\\s+`;

  const punctuation_pattern = "(?<=[.?!])\\s+";
  // const ponctuation_chars = [".", "!", "?"];
  // new RegExp(`(?:(?<=[${ponctuation_chars.join("")}]))\\s+`)
  str = str.replaceAll(/\s+/gim, " ");

  let regex = new RegExp(`(?:${punctuation_pattern})|(?:${dash_pattern})`, "g");
  // split() method used with a RegExp that contains capturing groups:
  // the matched results of these groups are included in the resulting array.
  // To avoid this behaviour, use non-capturing group (?:...)
  return str.split(regex);
}

/**
 * @description ByVal, splits the values of specified properties of an object into sentences.
 * @param {object} obj - The input object.
 * @param {string[]} keys - The keys of the properties to split.
 * @returns {object} - An object with the split values.
 */
export function splitToSentencesBy(obj, keys) {
  param_validator.validateKeyedObj(obj);
  param_validator.validateArrayOfStrings(keys);
  param_validator.warnArrOfEmptyStrings(keys);

  return keys.reduce((acc, k) => {
    let str;
    if ((str = obj[k]?.trim()) && typeof str === "string") {
      acc[k] = splitToSentences(str);
    }
    return acc;
  }, {});
}
