import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * @description Splits a sentence into fragments based on specified split levels.
 * @param {string} sentence - The sentence to be split.
 * @param {Array<RegExp>} split_lvls - An array of regular expressions used to split the sentence.
 * @returns {Array|string} - Returns the processed fragments or the original sentence if no splits are needed.
 */
export function splitToFragments(sentence, split_lvls) {
  param_validator.validateString(sentence);
  param_validator.validateArray(split_lvls);

  if (!sentence.trim() || split_lvls.length === 0) {
    return sentence;
  }

  return processFragment(sentence, split_lvls[0]);
}

// Recursive helper function to process each fragment
function processFragment(fragment, regex) {
  const splitResult = splitBy(fragment, regex);
  // If the fragment is no longer split, return it as is
  if (splitResult.length === 1 && splitResult[0] === fragment) {
    return [fragment];
  } else {
    // Otherwise, recursively process each sub-fragment
    return splitResult.map((subFragment) =>
      processFragment(subFragment, regex),
    );
  }
}

function splitBy(sentence, currentRegex) {
  // TODO - check that it also works for non capturing groups
  return sentence.split(currentRegex).filter((fragment) => fragment?.trim());
}

// // /* It's crucial to the recursion that the state of `split_lvls` remains unchanged,
// // so that, upon reaching a base case and backtracking, it can refer back to the original value of `split_lvls` and reset it.
// // Also, making a copy of `split_lvls` ensures that each recursion has its own independent `next_lvls` in isolation */
// let next_lvls = [...split_lvls];
// /* .shift() mutates the Array ByRef */
// let curr_rx = next_lvls.shift();

// // if the initial sentence was split into multiple parts, nest the results,
// // else return it directly to avoid unnecessary nesting
// /*   return fragments.flatMap((fragment) =>
//   processFragment(fragment, split_lvls[0]),
// ); */

function splitToFragments1(sentence, split_lvls) {
  param_validator.validateString(sentence);
  param_validator.validateArray(split_lvls);

  if (!sentence.trim() || split_lvls.length === 0) {
    return sentence;
  }

  /* It's crucial to the recursion that the state of `split_lvls` remains unchanged,
  so that, upon reaching a base case and backtracking, it can refer back to the original value of `split_lvls` and reset it.
  Also, making a copy of `split_lvls` ensures that each recursion has its own independent `next_lvls` in isolation */
  let next_lvls = [...split_lvls];
  /* .shift() mutates the Array ByRef */
  let curr_rx = next_lvls.shift();

  let fragments = splitBy(sentence, curr_rx);
  let results = fragments.map((fragment) =>
    splitToFragments1(fragment.trim(), next_lvls),
  );

  // if the original sentence was split into multiple parts, nest the results,
  // else return it directly to avoid unnecessary nesting
  return fragments.length === 1 && results.length === 1 ? results[0] : results;
}

function splitToFragments1_(sentence, split_lvls) {
  param_validator.validateString(sentence);
  param_validator.validateArray(split_lvls);

  // Base case: maximum recursion depth reached
  if (!sentence.trim() || split_lvls.length === 0) {
    return sentence;
  }

  /* It's crucial to the recursion that the state of `split_lvls` remains unchanged,
  so that, upon reaching a base case and backtracking, it can refer back to the original value of `split_lvls` and reset it.
  Also, making a copy of `split_lvls` ensures that each recursion has its own independent `next_lvls` in isolation */
  let next_lvls = [...split_lvls];
  /* .shift() mutates the Array ByRef */
  let curr_rx = next_lvls.shift();

  let fragments = splitBy(sentence, curr_rx);
  return fragments.reduce((acc, fragment) => {
    let splitResult = splitToFragments1_(fragment.trim(), next_lvls);
    // if the original sentence was split into multiple parts, nest the results
    if (fragments.length > 1) {
      acc.push(splitResult);
    } else {
      acc = acc.concat(splitResult);
    }
    return acc;
  }, []);
}

const escape_char = "\\";
const spaces = `\\s*`;

// first level of splitting is enclosing pair..
const enclosing_pairs = [
  ["[", "]"],
  ["{", "}"],
  ["(", ")"],
  ['"', '"'],
  ["'", "'"],
];
// capture everything between the first opening enclosure and the last closing enclosure,
// including any nested enclosusing pairs
let enclosing_pattern = enclosing_pairs
  .map((pair) => pair.map((elm) => `${escape_char}${elm}`).join("(.*)"))
  .join("|"); // `.` matches any character except for newline characters (\n)
let enclosing_regex = new RegExp(enclosing_pattern, "im");

// second level is punctuation..
const ponctuation_chars = [",", ";", ":"];
let ponctuation_pattern = `(?:${ponctuation_chars.join("|")})`;
let ponctuation_regex = new RegExp(ponctuation_pattern, "gim");

// third level is divider.
const dash_chars = [
  "\u002D",
  "\u2010",
  "\u2011",
  "\u2012",
  "\u2013",
  "\u2014",
  "\u2015",
  "\u2212",
];
const bar_chars = ["|", "\\", "/"];
let bar_pattern = bar_chars.map((char) => `${escape_char}${char}`);
let dash_pattern = `\\s+(?:${dash_chars.join("|")})\\s+`;
let divider_chars = bar_pattern.concat(dash_pattern);
/* Because of the non-capturing group (?:...), the seperator (trimming of leading and trailing spaces, included) is not included in the result.
  There are no capturing groups that would return `undefined` */
let divider_pattern = `(?:${spaces}(?:${divider_chars.join("|")})${spaces})`;
let divider_regex = new RegExp(divider_pattern, "gim");

const levels = [enclosing_regex, ponctuation_regex, divider_regex];
const sentence =
  // "Front-end - development, UI/UX – design, [software—engineering [FE [HTML, CSS] BE [Docker, Node.js]]], project–management";
  "sentence1 [software—engineering [FE [HTML, CSS] BE [Docker, Node.js]]] sentence2";
// let test = splitToFragments(sentence, levels);
// debugger;
