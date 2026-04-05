// https://github.com/andrebradshaw/utilities/blob/e1cf97527bb6b73af690c3bce4bde1d26423b01a/upload_and_search_TSV.js#L140
export function toRegexPatternEscape(str) {
  if (!arguments[0]) {
    return arguments[0];
  }
  const escape_char = "\\";
  return str.replace(/[.*+?^${}()|[\]\\]/g, `${escape_char}$&`); // `$&` inserts the matched substring. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_the_replacement
}
