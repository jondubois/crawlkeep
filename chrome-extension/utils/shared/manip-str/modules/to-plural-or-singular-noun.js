/**
 * Converts a singular noun to its plural form.
 * @param {string} str - The singular noun to be converted.
 * @returns {string} The plural form of the input noun.
 * @throws {Error} If the input parameter is not a string.
 */
function toPluralNoun(str) {
  if (typeof str !== "string") {
    throw new TypeError(
      `toPluralNoun - Invalid input. Expected ${str} to be a String. Instead, was passed ${typeof str}.`,
    );
  }
  if (!str.length) return str;
  return str.endsWith("y") ? str.replace(/y$/, "ies") : str.concat("s");
}
export { toPluralNoun };

/**
 * Converts a plural noun to its singular form.
 * @param {string} str - The plural noun to be converted.
 * @returns {string} The singular form of the input noun.
 * @throws {Error} If the input parameter is not a string.
 */
function toSingularNoun(str) {
  if (typeof str !== "string") {
    throw new TypeError(
      `toSingularNoun - Invalid input. Expected ${str} to be a String. Instead, was passed ${typeof str}.`,
    );
  }
  if (!str.length) return str;
  if (str.endsWith("ies")) {
    return str.replace(/ies$/, "y");
  } else if (str.endsWith("s")) {
    return str.slice(0, -1);
  }
  return str;
}
export { toSingularNoun };
