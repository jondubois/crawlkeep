/* I DON'T UNDERSTAND THIS CODE */
import { toRegexPatternFromSpeChar } from "../../../utils/manip-str/index.js";
import { permutate } from "../../../utils/manip-arr/index.js";

const identifyNearGroupFirstItm = (s) =>
  /\)$/.test(s)
    ? Array.from(s.match(/\(.+?\)/g)).at(-1)
    : s.split(/\sOR\s/i).at(-1);

const identifyNearGroupLastItm = (s) =>
  /^\(/.test(s) ? Array.from(s.match(/\(.+?\)/g))[0] : s.split(/\sOR\s/i)[0];

const isNearORSearch = (s) => /~\d*\s*\(|~\s*\(|\)\s*~/.test(s);

function processRemainingSearchString(s) {
  return s
    ?.trim()
    .split(/\s+\bor\b\s+/i)
    .map((ii) =>
      ii
        .replace(/\s*\)\s*/g, "")
        .replace(/\s*\(\s*/g, "")
        .replace(/\s+/g, ".{0,3}")
        .replace(/"/g, "\\b")
        .replace(/\*\*\*/g, ".{0,60}")
        .replace(/\*/g, ".{0,1}")
        .replace(/\+/g, "\\+"),
    )
    .reduce((a, b) => a + "|" + b);
}

function extractNearORGroups(arr) {
  arr.map((itm, i, r) =>
    itm == r[0]
      ? identifyNearGroupFirstItm(itm)
      : itm == r.at(-1)
        ? identifyNearGroupLastItm(itm)
        : /\(/.test(itm)
          ? /\(.+?\)/.exec(itm)?.[0]
          : /.+?(?=\sOR\s)/i.exec(itm)?.[0],
  );
  /* TODO - If `|` is used instead of OR, this will be a problem*/
}

export function processNearORstatement(str) {
  if (typeof str !== "string") {
    throw new TypeError(
      `processNearORstatement - Invalid input. Expected ${str} to be a string. Instead, got ${typeof str}`,
    );
  }
  if (!str.length) {
    return str;
  }

  if (isNearORSearch(str)) {
    let joiners = str.match(/~\d*/g)?.[0]
      ? Array.from(str.match(/~\d*/g)).map((d) =>
          /\d+/.test(d) ? `.{0,${/\d+/.exec(d)?.[0]}}` : `.{0,29}`,
        )
      : [];
    let near_items = extractNearORGroups(str.split(/~\d*/))
      .map((itm) => toRegexPatternFromSpeChar(itm))
      .map((r) => (r.some((i) => /\(|\)/.test(i)) ? r : [r[0]]));
    let near_perms = permutate(near_items)
      .map((arr) =>
        arr
          .map((r2) => r2.reduce((a, b) => a + "|" + b))
          .map((itm, i) => itm + (joiners[i] ? joiners[i] : ""))
          .reduce((a, b) => a + b),
      )
      .map((itm) => `(${itm})`)
      .join("|");

    let remove_this_string_from_input = near_items
      .map((itm, i, rr) =>
        itm[0] == rr.at(-1)[0]
          ? itm
              .at(-1)
              .replace(/\(/g, "\\(")
              .replace(/\)/g, "\\)")
              .replace(/\\b/g, '"')
          : itm[0]
              .replace(/\(/g, "\\(")
              .replace(/\)/g, "\\)")
              .replace(/\\b/g, '"'),
      )
      .reduce((a, b) => a + ".+?" + b);

    let remaining_input = processRemainingSearchString(
      str.replace(
        new RegExp(remove_this_string_from_input, "i"),
        `_____REPLACER_____`,
      ),
    );
    return {
      permutation_x_string: near_perms,
      remaining_input: remaining_input,
      fully_parsed: remaining_input.replace(
        /_____REPLACER_____/,
        `(${near_perms})`,
      ),
    };
  } else return null;
}
