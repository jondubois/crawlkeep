/**
 * Creates a regular expression object based on the provided string and flag.
 * @param {string} pattern - The pattern to create the regular expression from.
 * @param {string} [flag] - The flag to be used for the regular expression.
 * @returns {RegExp} - The regular expression object if successful, otherwise a neutral fallback RegExp.
 */
export function tryRegExp(pattern, flag) {
  try {
    return new RegExp(pattern, flag);
  } catch (error) {
    try {
      return new RegExp(pattern?.replace(/\W+/g, "\\W+?"), flag);
    } catch (err) {
      console.error(error, err);
      return /(?:)/; /* neutral fallback no-op regexp. This is a non-capturing group that matches an empty string. Similar to /^$/
                      It does not assert any position or content, and it effectively does nothing. */
    }
  }
}
