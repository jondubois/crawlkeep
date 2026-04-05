import { v4 as uuidv4 } from "uuid";
// local imports
import { isEmptyObj } from "../../check/modules/is-empty-obj.js";
import { typeOf } from "../../type-of.js";
// import { copyToClipboard } from "../../../nodejs/copy-to-clipboard.js";

// external imports
import {
  Divider,
  EnclosingDivider,
} from "../../../../classes/modules/divider.js";

function splitBy(string, regex) {
  if (typeof string !== "string" || !(regex instanceof RegExp)) {
    throw new TypeError(`splitBy - Invalid input. Expected:
      - ${string} a string. Instead, was passed ${typeof string}
      - ${regex} to be a RegExp. Instead, was passed ${typeOf(regex)}.`);
  }

  if (!string) {
    return [];
  }
  return string.split(regex).filter((fragment) => fragment?.trim());
}

export function splitLeaf(node, dag, divider) {
  if (
    !node.label ||
    isEmptyObj(dag) ||
    !(divider instanceof Divider || divider instanceof EnclosingDivider)
  ) {
    throw new TypeError(
      `splitLeaf - Invalid input. Expected:
      - ${node.label} to be a string, yet got ${typeof node.label}
      - ${dag} to be a non-empty keyed Object, yet got ${typeof dag}
      - ${divider} to be an instance of Divider or EnclosingDivider, yet got ${typeof divider}`,
    );
  }

  const regex = divider.tryRegExp();
  if (regex instanceof Error) {
    throw regex; // If regex creation failed, throw the error
  }

  let stack = [node];
  let visited = new Set();

  while (stack.length > 0) {
    let currentNode = stack.pop();
    let { id } = currentNode;
    currentNode.label = currentNode.label.trim();

    if (!visited.has(id)) {
      // mark node as visited
      visited.add(id);
      const isLeaf = !dag.edges.some((edge) => edge.from === id);
      if (isLeaf) {
        const splitResult = splitBy(currentNode.label, regex);
        splitResult.forEach((childSentence) => {
          childSentence = childSentence.trim();
          if (childSentence && childSentence !== currentNode.label) {
            const newId = uuidv4();
            const newNode = {
              id: newId,
              label: childSentence,
              operator: divider.operator,
            };
            dag.nodes.push(newNode);
            dag.edges.push({ from: id, to: newId });
            stack.push(newNode);
          }
        });
      } else {
        // Add children to the stack for non-leaf nodes
        dag.edges.forEach((edge) => {
          if (edge.from === id && !visited.has(edge.to)) {
            const childNode = dag.nodes.find((n) => n.id === edge.to);
            if (childNode) stack.push(childNode);
          }
        });
      }
    }
  }
}

// /**
//  * Splits a `sentence` based on a user-defined `regex` RegExp,
//  * and maps the hierarchical parent-child relationships into a Directed Acyclic Graph (DAG).
//  * Each node in the DAG represents a unique fragment of the sentence, and edges represent parent-child relationships.
//  * @param {string} sentence - The sentence to split.
//  * @param {RegExp} regex - The regex pattern to split the sentence by.
//  * @returns {Object} - An object representing the DAG (Directed Acyclic Graph) with nodes and edges.
//  */
// export function splitToDAG(sentence, regex) {
//   if (typeof sentence !== "string" || !(regex instanceof RegExp)) {
//     throw new Error(
//       `splitToDAG - Invalid input. Expected ${sentence} to be a string and ${regex} to be a RegExp.`,
//     );
//   }

//   if (!sentence) {
//     return { nodes: [], edges: [] }; // base case with no child
//   }

//   let stack = [{ sentence: sentence, parentId: null, id: uuidv4() }]; // initial stack
//   let nodes = {}; // to store unique nodes
//   let edges = []; // to store edges
//   let visited = new Set(); // tracks visited nodes by UUID

//   while (stack.length > 0) {
//     let { sentence: currentSentence, parentId, id } = stack.pop();
//     currentSentence = currentSentence?.trim(); // unlikely to be `undefined` as derived from `sentence`, a non-empty string

//     if (!visited.has(id)) {
//       visited.add(id); // Mark the node as visited

//       // Add the current node to the nodes list
//       if (!nodes[id]) {
//         nodes[id] = { id, label: currentSentence };
//         if (parentId) {
//           // If there's a parent, add an edge from the parent to the current node
//           edges.push({ from: parentId, to: id });
//         }
//       }

//       const splitResult = splitBy(currentSentence, regex);
//       splitResult.forEach((childSentence) => {
//         if (childSentence && childSentence !== currentSentence) {
//           stack.push({ sentence: childSentence, parentId: id, id: uuidv4() });
//         }
//       });
//     }
//   }

//   return { nodes: Object.values(nodes), edges };
// }

// function processLeafNodes(nodeId, dag, processFunction) {
//   const node = dag.nodes[nodeId];
//   // Check if the node is a leaf node
//   if (node.children.length === 0) {
//     // Process the leaf node, e.g., by passing its text to a function
//     processFunction(node.text);
//   } else {
//     // Recurse over each child node
//     node.children.forEach((childId) =>
//       processLeafNodes(childId, dag, processFunction),
//     );
//   }
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
// /* Because of the non-capturing group (?:...), the seperator (trimming of leading and trailing spaces, included) is not included in the result.
//   There are no capturing groups that would return `undefined` */
// // Variable-Length Lookbehind not supported: couldn't use `\s+`. TODO - edge case: if `\s+`   |(?<!\sand\b)\s+\(|\)\s+(?!\band\b)
// let and_regex = /\b(?:\s+\band\b\s+)\b/gim;

// // third level is divider.
// let or_regex = /\b(?:\s+\bor\b\s+)\b/gim; // /\s+\bor\b\s+|(?<!\sor\b)\s+\(|\)\s+(?!\bor\b)/i;
