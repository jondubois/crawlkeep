// import param_validator from "../../../../classes/modules/param-validator.js";

// /**
//  * @description Splits a sentence into fragments based on specified split levels.
//  * @param {string} sentence - The sentence to be split.
//  * @param {Array<RegExp>} split_lvls - An array of regular expressions used to split the sentence.
//  * @returns {Array<string>} - Returns an array of processed fragments.
//  */
// export function splitToFragments0(sentence, split_lvls) {
//   param_validator.validateString(sentence);
//   param_validator.validateArray(split_lvls);

//   if (!sentence.trim() || !split_lvls.length) {
//     return sentence;
//   }

//   let stack = [sentence];
//   let processedFragments = [];
//   let visited = new Set(); // Use a Set to track visited fragments

//   while (stack.length > 0) {
//     const currentFragment = stack.pop();

//     if (!visited.has(currentFragment)) {
//       visited.add(currentFragment); // Mark the fragment as visited

//       const splitResult = splitBy(currentFragment, split_lvls[0]);
//       if (splitResult.length !== 1 || splitResult[0] !== currentFragment) {
//         // Otherwise, push the resulting fragments onto the stack for further processing
//         splitResult.forEach((fragment) => stack.push(fragment.trim()));
//       } else {
//         // If the fragment cannot be split further, add it to the results
//         processedFragments.push(currentFragment);
//       }
//     }
//   }
//   return processedFragments;
// }

// function splitBy(sentence, currentRegex) {
//   return sentence.split(currentRegex).filter((fragment) => fragment?.trim());
// }

// function splitToFragmentsDFS0(sentence, split_lvls) {
//   param_validator.validateString(sentence);
//   param_validator.validateArray(split_lvls);

//   if (!sentence.trim() || !split_lvls.length) {
//     return sentence;
//   }

//   let next_lvls = [...split_lvls];
//   let curr_rx = next_lvls.shift();

//   // initialise the stack with the initial sentence
//   let stack = [sentence];
//   let results = [];

//   while (stack.length > 0) {
//     let currentFragment = stack.pop();
//     let splitResult = splitBy(currentFragment, curr_rx);

//     if (splitResult.length === 1 && splitResult[0] === currentFragment) {
//       // If the fragment cannot be split further, add it to results
//       results.push(currentFragment);
//     } else {
//       // Otherwise, push each split fragment onto the stack for further processing
//       splitResult.forEach((fragment) => {
//         if (next_lvls.length > 0) {
//           // If there are more levels to split, update curr_rx and continue splitting
//           curr_rx = next_lvls.shift();
//           stack.push(fragment);
//         } else {
//           // If no more levels, add the final fragments to results
//           results.push(fragment);
//         }
//       });
//     }
//   }

//   return results;
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
// // capture everything between the first opening enclosure and the last closing enclosure,
// // including any nested enclosusing pairs
// let enclosing_pattern = enclosing_pairs
//   .map((pair) => pair.map((elm) => `${escape_char}${elm}`).join("(.*)"))
//   .join("|"); // `.` matches any character except for newline characters (\n)
// let enclosing_regex = new RegExp(enclosing_pattern, "im");

// /* Premise of a solution to the edge case: "[FE [HTML, CSS] BE [Docker, Node.js]]"
// // capture everything between the innermost nested enclosed pair OR pairs
// // https://stackoverflow.com/questions/14952113/how-can-i-match-nested-brackets-using-regex#comment56000357_25489964
// let base_enclosing_pattern = enclosing_pairs
//   .map(
//     ([leading, trailing]) =>
//       `(${escape_char}${leading}(?:${escape_char}${leading}??[^${escape_char}${leading}]*?${escape_char}${trailing}))`,
//   )
//   .join("|");
// let base_enclosing_regex = new RegExp(base_enclosing_pattern, "im");  */

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

// const levels = [enclosing_regex, ponctuation_regex, divider_regex];
// // const sentence =
// //   "Front-end - development, UI/UX – design, software—engineering, project–management";
// const sentence =
//   "sentence1 [software—engineering, [FE [HTML, CSS] BE ]] sentence2";
// let test = splitToFragments0(sentence, levels);
// debugger;
