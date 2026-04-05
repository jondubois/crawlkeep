// import param_validator from "../../../../classes/modules/param-validator.js";

// /**
//  * Splits a sentence into fragments following 3 levels of destructuration.
//  *
//  * @param {string} sentence - The sentence to be split into fragments.
//  * @returns {string[]} An array of fragments obtained from `sentence`.
//  */
// // TODO - move the body of the function outside of scope,
// // and just pass `levels` as an argument
// export function splitToFragments(sentence) {
//   param_validator.validateString(sentence);

//   const escape_char = "\\";
//   const spaces = `\\s*`;

//   // first level of splitting is enclosing pair..
//   const enclosing_pairs = [
//     ["[", "]"],
//     ["{", "}"],
//     ["(", ")"],
//     ['"', '"'],
//     ["'", "'"],
//   ];
//   let enclosing_pattern = enclosing_pairs
//     .map((pair) => pair.map((elm) => `${escape_char}${elm}`).join("(.+?)"))
//     .join("|");
//   let enclosing_regex = new RegExp(enclosing_pattern, "im");

//   // second level is punctuation..
//   const ponctuation_chars = [",", ";", ":"];
//   let ponctuation_pattern = `(?:${ponctuation_chars.join("|")})`;
//   let ponctuation_regex = new RegExp(ponctuation_pattern, "gim");

//   // third level is divider.
//   const dash_chars = [
//     "\u002D",
//     "\u2010",
//     "\u2011",
//     "\u2012",
//     "\u2013",
//     "\u2014",
//     "\u2015",
//     "\u2212",
//   ];
//   const bar_chars = ["|", "\\", "/"];
//   let bar_pattern = bar_chars.map((char) => `${escape_char}${char}`);
//   let dash_pattern = `\\s+(?:${dash_chars.join("|")})\\s+`;
//   let divider_chars = bar_pattern.concat(dash_pattern);
//   /* Because of the non-capturing group (?:...), the seperator (trimming of leading and trailing spaces, included) is not included in the result.
//     There are no capturing groups that would return `undefined` */
//   let divider_pattern = `(?:${spaces}(?:${divider_chars.join("|")})${spaces})`;
//   let divider_regex = new RegExp(divider_pattern, "gim");

//   // Define splitting criteria for different levels outside the recursive function
//   const levels = [enclosing_regex, ponctuation_regex, divider_regex];
//   return splitBy(sentence, levels, 0);
// }

// /**
//  * Splits a sentence into fragments based on specified levels of splitting.
//  *
//  * @param {string} sentence - The sentence to be split into fragments.
//  * @param {Array<RegExp>} split_lvls - An array of regular expressions defining the splitting criteria at each level.
//  * @param {number} curr_lvl - The current level of splitting.
//  * @returns {string|string[]} The original sentence if no further splitting is needed, or an array of fragments.
//  */
// function splitBy(sentence, split_lvls, curr_lvl) {
//   param_validator.validateString(sentence);
//   param_validator.validateArray(split_lvls);
//   param_validator.validateNumber(curr_lvl);

//   if (!sentence.trim()) {
//     return sentence;
//   }

//   if (curr_lvl >= split_lvls.length) {
//     return sentence; // No more levels to split, return sentence as is
//   }

//   const regex = split_lvls[curr_lvl];
//   const fragments = sentence
//     /* split() method used with a RegExp that contains capturing groups:
//       the matched results of these groups are included in the resulting array.
//       the regexp is always sticky ie. g ("global") flag is ignored, matching moves along the string,
//       each time yielding a matching string, index, and any capturing groups.
//       `sentence.split(enclosing_regex)` is equivalent to `enclosing_regex[Symbol.split](sentence)`
//       https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/@@split */
//     .split(regex)
//     // .trim() that returns empty string is considered "falsy", just like `undefined`, hence both return `[]`,
//     // which is then flattened / filtered out by `.flatMap()`
//     .flatMap((subFragment) => subFragment?.trim() || []);

//   if (fragments.length === 1 && fragments[0] === sentence) {
//     // If no splitting occurred, try the next level
//     return splitBy(sentence, split_lvls, curr_lvl + 1);
//   } else {
//     // If splitting occurred, apply splitBy recursively to each fragment
//     return fragments.map((frag) => splitBy(frag, split_lvls, curr_lvl));
//   }
// }

// /**
//  * Splits a sentence into fragments by Breadth-First Search (BFS) algorithm.
//  *
//  * @param {string} sentence - The sentence to be split into fragments.
//  * @param {Array<RegExp>} split_lvls - An array of regular expressions defining the splitting criteria at each level.
//  * @returns {string[]} An array of fragments, each one being the result of splitting the original sentence by the specified levels.
//  */
// function splitByBFS(sentence, split_lvls) {
//   param_validator.validateString(sentence);
//   param_validator.validateArray(split_lvls);

//   if (!sentence.trim()) {
//     return [sentence]; // Return sentence in an array to keep the return type consistent
//   }

//   let fragments = sentence; // initialise loop accumulator with the original sentence

//   while (split_lvls.length > 0) {
//     let currentLevel = split_lvls.shift(); // Directly dequeue from split_lvls
//     let regex = new RegExp(currentLevel);
//     // Apply .flatMap() here to process each sentence individually
//     // currentSentences = currentSentences.flatMap((sentence) =>
//     //   splitRecursive(sentence, regex),
//     // );

//     // fragments = fragments.flatMap((frag) => splitRecursive(frag, regex));
//     if (Array.isArray(fragments)) {
//       // && fragments.length > 1
//       // splitting occurred
//       fragments = fragments.flatMap((frag) => splitRecursive(frag, regex));
//     } else {
//       // no splitting occurred
//       fragments = splitRecursive(fragments, regex).flat();
//     }

//     // fragments = fragments.flatMap((sentence) => {
//     // if (typeof sentence === "string") {
//     //   return splitRecursive(sentence, regex);
//     // } else if (Array.isArray(sentence)) {
//     //   return sentence.map((part) => splitRecursive(part, regex));
//     // }
//     // });
//   }
//   return fragments;
// }

// // Modified to take a single sentence
// function splitRecursive(sentence, regex) {
//   return (
//     sentence
//       .split(regex)
//       // .trim() that returns empty string is considered "falsy", just like `undefined`, hence both return `[]`,
//       // which is then flattened / filtered out by `.flatMap()`
//       .flatMap((subFragment) => subFragment?.trim() || [])
//   );
// }

// const escape_char = "\\";
// const spaces = `\\s*`;

// // first level of splitting is enclosing pair..
// const enclosing_pairs = [
//   ["[", "]"],
//   ["{", "}"],
//   ["(", ")"],
//   ['"', '"'],
//   ["'", "'"],
// ];
// let enclosing_pattern = enclosing_pairs
//   .map((pair) => pair.map((elm) => `${escape_char}${elm}`).join("(.+?)"))
//   .join("|");
// let enclosing_regex = new RegExp(enclosing_pattern, "im");

// // second level is punctuation..
// const ponctuation_chars = [",", ";", ":"];
// let ponctuation_pattern = `(?:${ponctuation_chars.join("|")})`;
// let ponctuation_regex = new RegExp(ponctuation_pattern, "gim");

// // third level is divider.
// const dash_chars = [
//   "\u002D",
//   "\u2010",
//   "\u2011",
//   "\u2012",
//   "\u2013",
//   "\u2014",
//   "\u2015",
//   "\u2212",
// ];
// const bar_chars = ["|", "\\", "/"];
// let bar_pattern = bar_chars.map((char) => `${escape_char}${char}`);
// let dash_pattern = `\\s+(?:${dash_chars.join("|")})\\s+`;
// let divider_chars = bar_pattern.concat(dash_pattern);
// /* Because of the non-capturing group (?:...), the seperator (trimming of leading and trailing spaces, included) is not included in the result.
//   There are no capturing groups that would return `undefined` */
// let divider_pattern = `(?:${spaces}(?:${divider_chars.join("|")})${spaces})`;
// let divider_regex = new RegExp(divider_pattern, "gim");

// // Define splitting criteria for different levels outside the recursive function
// const levels = [enclosing_regex, ponctuation_regex, divider_regex];
// const sentence =
//   "Front-end - development, UI/UX – design, software—engineering, project–management";
// let test0 = splitByBFS(sentence, levels);
// // let test1 = splitToFragments(sentence);
// debugger;
