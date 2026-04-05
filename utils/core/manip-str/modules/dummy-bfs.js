// import param_validator from "../../../../classes/modules/param-validator.js";

// export function splitToFragments0(sentence, split_lvls) {
//   param_validator.validateString(sentence);
//   param_validator.validateArray(split_lvls);

//   if (!sentence.trim() || !split_lvls.length) {
//     return { [sentence]: [] }; // Return a mapping for the root sentence to no children
//   }

//   let stack = [{ fragment: sentence, parent: null }];
//   let relationships = {}; // Tracks parent-child relationships

//   while (stack.length > 0) {
//     const { fragment, parent } = stack.pop();

//     if (!relationships[fragment]) {
//       relationships[fragment] = []; // initialise the children list

//       const splitResult = splitBy(fragment, split_lvls[0]);
//       if (splitResult.length !== 1 || splitResult[0] !== fragment) {
//         splitResult.forEach((childFragment) => {
//           const trimmedChild = childFragment.trim();
//           if (trimmedChild) {
//             stack.push({ fragment: trimmedChild, parent: fragment });
//             relationships[fragment].push(trimmedChild);
//           }
//         });
//       }
//     }
//   }

//   return relationships;
// }

// function splitBy(sentence, currentRegex) {
//   return sentence.split(currentRegex).filter((fragment) => fragment?.trim());
// }

// class TreeNode {
//   constructor(value) {
//     this.value = value;
//     this.children = [];
//   }
// }

// function buildTreeWithBFT(relationships, rootValue) {
//   let root = new TreeNode(rootValue);
//   let map = new Map();
//   map.set(rootValue, root);

//   let queue = [rootValue];

//   while (queue.length > 0) {
//     let current = queue.shift();
//     let currentNode = map.get(current);

//     (relationships[current] || []).forEach((childValue) => {
//       if (!map.has(childValue)) {
//         let childNode = new TreeNode(childValue);
//         map.set(childValue, childNode);
//         currentNode.children.push(childNode);
//         queue.push(childValue);
//       }
//     });
//   }

//   return root;
// }

// function printTree(node, prefix = "") {
//   console.log(prefix + node.value);
//   node.children.forEach((child) => printTree(child, prefix + "  "));
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

// let relationships = splitToFragments0(sentence, levels);
// let treeRoot = buildTreeWithBFT(relationships, sentence);
// printTree(treeRoot);

// debugger;
// // expected output:
// [sentence1,
//     [software—engineering,
//         [FE,
//             [HTML, CSS],
//         BE ],
//     ],
// sentence2]
