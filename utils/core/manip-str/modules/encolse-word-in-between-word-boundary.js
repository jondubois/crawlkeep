const WORD_BOUNDARY_PATTERN = "\\b";

export function prependWordBoundary(word) {
  return /^\w/.test(word) ? `${WORD_BOUNDARY_PATTERN}${word}` : word;
}
export function appendWordBoundary(word) {
  return /\w$/.test(word) ? `${word}${WORD_BOUNDARY_PATTERN}` : word;
}
