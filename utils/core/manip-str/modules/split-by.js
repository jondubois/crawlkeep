import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Splits a string by a given regular expression and filters out empty fragments.
 * @param {string} string - The string to be split.
 * @param {RegExp} regex - The regular expression pattern to split the string by.
 * @returns {string[]} An array of non-empty string fragments resulting from the split.
 */
export function splitBy(string, regex) {
  param_validator.validateString(string);
  param_validator.validateRegExp(regex);

  if (!string) {
    return string;
  }
  return (
    string
      .split(regex)
      /* split() method used with a RegExp that contains capturing groups:
      the matched results of these groups are included in the resulting array.
      the regexp is always sticky ie. g ("global") flag is ignored, matching moves along the string,
      each time yielding a matching string, index, and any capturing groups.
      `string.split(enclosing_regex)` is equivalent to `enclosing_regex[Symbol.split](string)`
      https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/@@split */
      .filter((fragment) => fragment?.trim())
  );
}
