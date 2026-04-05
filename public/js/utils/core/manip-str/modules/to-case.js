// for naming classes, interfaces, and types
export function toPascalCase(str) {
  if (!str) {
    return str;
  }
  return str
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\B\w/g, (letter) => letter.toLowerCase());
}

/**
 * @description Converts a snake_case string to human-readable text with capitalized words.
 * @param {string} snake_case - The snake_case string to convert.
 * @return {string} The formatted text string.
 */
export function toTextFrom(snake_case) {
  return snake_case
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
