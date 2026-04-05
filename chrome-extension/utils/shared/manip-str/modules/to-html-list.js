import { toRegexPatternEscape } from "./to-regex-pattern-escape.js";

export function toHtmlList(str) {
  if (typeof arguments[0] !== "string") {
    throw new TypeError(
      `${toHtmlList.name} - Invalid input. Expected ${
        arguments[0]
      } to be a String. Instead, was passed ${typeof arguments[0]}`,
    );
  }
  if (!arguments[0]) {
    return arguments[0];
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

  const bullet_points = [
    "\u2022", // Bullet (•)
    "\u25E6", // White Bullet (◦)
    "\u25AA", // Black Small Square (▪)
    "\u25AB", // White Small Square (▫)
    "\u25CF", // Black Circle (●)
    "\u25D8", // Inverse Bullet (◘)
    "\u25E6", // White Bullet (◦)
    "\u25E6", // White Bullet (◦)
    "\u2022", // Bullet (•)
  ];
  const bullet_point_pattern = bullet_points
    .map((char) => toRegexPatternEscape(char))
    .join("|");

  const mixed_pattern = dash_chars
    .concat(bullet_points)
    .map((char) => toRegexPatternEscape(char))
    .join("|");

  const inner_list_pattern = `:\\s*(?:${mixed_pattern})\\s*`;
  const list_pattern = `\\s*(?:${bullet_point_pattern})\\s*|^\\s*(?:${mixed_pattern})\\s*|[,;.]\\s*(?:${mixed_pattern})\\s*`;
  const inner_list_rx = new RegExp(inner_list_pattern, "gim");
  const list_rx = new RegExp(list_pattern, "gim");

  let parts = [];
  let ini_p = null;
  str = str.trim();
  parts = str.split(inner_list_rx);
  if (inner_list_rx.test(str)) {
    ini_p = `<p>${parts.shift()}:</p>`;
    parts = parts.flatMap((sub_str) => sub_str.split(list_rx));
  } else {
    parts = str.split(list_rx);
  }

  if (parts.length === 1) return `<p>${parts.shift()}</p>`;

  const li_html = parts
    .filter((part) => part.trim() !== "") // filter out empty parts
    .map((sub_string) => `<li><p>${sub_string}</p></li>`)
    .join("");
  const ul_html = `<ul>${li_html}</ul>`;
  return ini_p ? ini_p.concat(ul_html) : ul_html;
}
// const ini_p =
//   parts[1] === ""
//     ? `<p>${parts.shift()}</p>`
//     : null; /* if separator appears at the beginning (or end) of the string, it still has the effect of splitting,
//               resulting in an empty (i.e. zero length) string appearing at the first (or last) position of the returned array. */
