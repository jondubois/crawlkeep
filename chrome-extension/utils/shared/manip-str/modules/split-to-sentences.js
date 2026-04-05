/**
 * Splits a string into an array of sentences.
 * @param {string} str - The input string to be split.
 * @returns {string[]} - An array of sentences.
 * @throws {Error} - If the input string is empty or not a string.
 */
export function splitToSentences(str) {
  if (typeof str !== "string") {
    throw new TypeError(
      `splitToSentences - Invalid input. Expected ${str} to be a String. Instead, was passed ${typeof str}.`,
    );
  }
  if (!str) {
    return [str];
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

  let regex = new RegExp(`(?:${punctuation_pattern})`, "g"); // |(?:${dash_pattern})
  // split() method used with a RegExp that contains capturing groups:
  // the matched results of these groups are included in the resulting array.
  // To avoid this behaviour, use non-capturing group (?:...)
  return str.split(regex);
}

/**
 * ByVal, splits the values of specified properties of an object into sentences.
 * @param {object} obj - The input object.
 * @param {string[]} props - The properties to split.
 * @returns {object} - An object with the split values.
 */
function splitToSentencesBy(obj, props) {
  return props.reduce((acc, prop) => {
    let str;
    if ((str = obj[prop]?.trim()) && typeof str === "string") {
      acc[prop] = splitToSentences(str);
    }
    return acc;
  }, {});
}
export { splitToSentencesBy };
