import { v4 as uuidv4 } from "uuid";
import param_validator from "../../../../classes/modules/param-validator.js";

/**
 * Splits of `sentence`, based on user-defined `regex` RegExp,
 * and maps the hierarchical parent-child relationships `hierar_relationships` .
 * @param {string} sentence - The sentence to split.
 * @param {RegExp} regex - The regex pattern to split the sentence by.
 * @returns {Object} - An object representing the hierarchical parent-child relationships.
 */
export function splitToRelationship(sentence, regex) {
  param_validator.validateString(sentence);
  param_validator.validateRegExp(regex);

  if (!sentence.trim()) {
    return { [sentence]: [] }; // base case with no child
  }

  let stack = [{ children: sentence, parent: null, id: uuidv4() }]; // UUID to cater for edge case of identical fragments
  let hierar_relationships = {}; // tracks parent-child relationship
  let visited = new Set(); // tracks visited fragments by UUID

  while (stack.length > 0) {
    const { children, id } = stack.pop();
    const fragment = children?.trim(); // unlikely to be `undefined` as derived from `sentence`, a non-empty string
    if (!visited.has(id)) {
      // mark the fragment as visited
      visited.add(id);

      const split_result = splitBy(fragment, regex);
      if (split_result.length !== 1 || split_result[0] !== fragment) {
        // push the split fragments onto the stack for further processing
        split_result.forEach((frag) => {
          const trimmed_frag = frag.trim();
          if (trimmed_frag) {
            stack.push({
              children: trimmed_frag,
              parent: fragment,
              id: uuidv4(),
            });
            // Use concat to add the child, reassigning the result back to the hierarchy
            hierar_relationships[fragment] = (
              hierar_relationships[fragment] || []
            ).concat(trimmed_frag);
          }
        });
      }
    }
  }
  return hierar_relationships;
}

function splitBy(string, regex) {
  param_validator.validateString(string);
  param_validator.validateRegExp(regex);

  if (!string) {
    return string;
  }
  return string.split(regex).filter((fragment) => fragment?.trim());
}

/* *********************************************************************************************/

class TreeNode {
  constructor(value) {
    this.value = value;
    this.children = [];
  }
}

/**
 * Converts a hierarchical parent-child relationship object into a hierarchical tree using breadth-first search.
 * @param {Object} relationships - An object representing the hierarchical parent-child relationships.
 * @param {any} root_val - The value of the root node.
 * @returns {TreeNode} - The root node of the hierarchical tree.
 */
export function toHierarchicalTreeBFS(relationships, root_val) {
  let root = new TreeNode(root_val);
  let map = new Map();
  map.set(root_val, root);

  let queue = [root_val];

  while (queue.length > 0) {
    let curr = queue.shift();
    let curr_node = map.get(curr);

    (relationships[curr] || []).forEach((child_val) => {
      if (!map.has(child_val)) {
        let child_node = new TreeNode(child_val);
        map.set(child_val, child_node);
        curr_node.children.push(child_node);
        queue.push(child_val);
      }
    });
  }
  return root;
}

function printTree(node, prefix = "") {
  console.log(prefix + node.value);
  node.children.forEach((child) => printTree(child, prefix + "  "));
}

function traverseTree(node) {
  // Check if the current node is a leaf node
  if (node.children.length === 0) {
    // Process the leaf node, e.g., print its value
    console.log("Leaf node:", node.value);
  } else {
    // Process the current node if needed
    console.log("Node:", node.value);

    // Recurse over the children nodes
    node.children.forEach((child) => {
      traverseTree(child);
    });
  }
}

// Assuming `treeRoot` is the root node of the hierarchical tree structure
// obtained from `toHierarchicalTreeBFS`
// traverseTree(treeRoot);

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
//   // capture everything between the innermost nested enclosed pair OR pairs
//   // https://stackoverflow.com/questions/14952113/how-can-i-match-nested-brackets-using-regex#comment56000357_25489964
//   let base_enclosing_pattern = enclosing_pairs
//     .map(
//       ([leading, trailing]) =>
//         `(${escape_char}${leading}(?:${escape_char}${leading}??[^${escape_char}${leading}]*?${escape_char}${trailing}))`,
//     )
//     .join("|");
//   let base_enclosing_regex = new RegExp(base_enclosing_pattern, "im");  */

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
//     There are no capturing groups that would return `undefined` */
// let divider_pattern = `(?:${spaces}(?:${divider_chars.join("|")})${spaces})`;
// let divider_regex = new RegExp(divider_pattern, "gim");

// const levels = [enclosing_regex, ponctuation_regex, divider_regex];
// // const sentence =
// //   "Front-end - development, UI/UX – design, software—engineering, project–management";
// const sentence =
//   "sentence1 [software—engineering, [FE [HTML, CSS] BE ]] sentence2";

// let relationships = splitToRelationship(sentence, levels);
// let treeRoot = toHierarchicalTreeBFS(relationships, sentence);

// // printTree(treeRoot);

// // copyToClipboard(JSON.stringify(treeRoot, null, 2), null, 2);
