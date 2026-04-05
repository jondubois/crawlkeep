// import {
//   toRegexPatternFromSpeChar,
//   toRegexPatternFromNear,
//   tryRegExp,
//   keepSurroundingSentences,
//   permutate,
// } from "../../utils/index.js";
// import {
//   Divider,
//   NodesEdgesCollectionParser,
//   TreeParser,
// } from "../../classes/index.js";

// // local imports
// import { splitAroundOuterEnclosingParentheses } from "../../../data-manip/feature3-is-match-boolean-search-string/modules/split-around-outer-enclosing-parentheses.js";
// import { TaxoParser } from "../taxonomy/classes/taxo-parser.js";
// const taxo_parser = await TaxoParser.getInstance();
// const tree_parser = new TreeParser();

// const flag = "gim";
// const bool_operators = ["AND", "OR", "NOT"];
// const [and_divider, or_divider, not_divider] = bool_operators.map(
//   (op) => new Divider(op),
// );
// const bool_divs = [and_divider, or_divider]; // , not_divider
// // const lt_dividers = bool_operators.map((op) => new LeadTrailingDivider(op));
// // const lt_div_regexes = lt_dividers.map((div) => div.tryRegExp());
// // const paranthesis_divider = new EnclosingDivider("()", [["(", ")"]]);
// const kw_search_dag = new NodesEdgesCollectionParser();

// function tryTaxoEquivalent(kw, taxonomy) {
//   let criterium = taxonomy.find((crit) => crit.name === kw);
//   if (criterium?.regex_pattern.length) {
//     return criterium.regex_pattern.join("|");
//   }
//   return kw;
// }

// /**
//  * @description Converts a keyword search string into a tree structure.
//  * @param {string} bool_search_str
//  * @returns {object} tree - The tree structure representing the keyword search string.
//  *
//  * @todo /!\ Doesn't work passed `leaf_nodes`
//  * `toSpeRegex` was decommisisoned and replaced by `toRegexpPattern`,
//  */
// export function convertKwSearchStringToTree(bool_search_str) {
//   kw_search_dag.initDAG(bool_search_str);
//   // split leaf nodes around enclosing parentheses
//   kw_search_dag.splitLeafByFunc(
//     kw_search_dag.root_node,
//     splitAroundOuterEnclosingParentheses,
//   );
//   // split around Boolean operators
//   bool_divs.forEach((div) =>
//     kw_search_dag.splitLeafByDiv(kw_search_dag.root_node, div),
//   );
//   // get leaf nodes
//   kw_search_dag.toNodeTreeBy();
//   tree_parser.setStateTo(kw_search_dag.root_node);
//   let leaf_nodes = tree_parser.getLeafNodesBy();

//   // set RegExp of leaf nodes (Near-search operators + special characters + taxo equivalence)
//   leaf_nodes.forEach((node) => {
//     // handle Near-search operators
//     let rx_pattern = toRegexPatternFromSpeChar(node.label);
//     let parts = rx_pattern.split(/(~\d*)/g).filter((part) => part.trim());
//     // it takes 2 or more to permute
//     if (parts.length >= 2) {
//       // keywords from the split of Boolean criterium `node.regex_pattern` are grouped by Near-search operators
//       let substrings = keepSurroundingSentences(parts, /~\d*/, 1);
//       let near_substrings = {};
//       for (let i = 0; i < substrings.length; i++) {
//         let match = substrings[i].match(/~\d*/);
//         if (match) {
//           let near_operand = match[0];
//           near_substrings[near_operand] = (
//             near_substrings[near_operand] || []
//           ).concat([
//             ...(substrings[i - 1] ? [substrings[i - 1]] : []),
//             ...(substrings[i + 1] ? [substrings[i + 1]] : []),
//           ]);
//         }
//       }
//       // turn Near-search operators into RegExps
//       let near_rx_substrings = {}; // `near_rx_substrings` is a shallow copy of `near_substrings`
//       Object.keys(near_substrings).forEach((key) => {
//         const rx_key = toRegexPatternFromNear(key);
//         near_rx_substrings[rx_key] = near_substrings[key];
//       });

//       // handle taxo equivalence
//       Object.entries(near_rx_substrings).forEach(([near_op, arr]) => {
//         near_rx_substrings[near_op] = arr.map((kw) =>
//           tryTaxoEquivalent(kw, taxo_parser.root_node),
//         );
//       });

//       // permute values of `near_rx_substrings` around key of `near_rx_substrings`
//       Object.entries(near_rx_substrings).forEach(([near_op, arr]) => {
//         near_rx_substrings[near_op] = permutate(arr).map((permArr) =>
//           permArr.join(near_op),
//         );
//       });
//       // // TODO - for each regExp pattern, should ideally create a new node with "AND" operator
//       // if (node.regex_pattern.length > 1) {
//       //   node.label = node.regex_pattern.join(" AND ");
//       //   kw_search_dag.splitLeaf(kw_search_dag.root_node, and_divider);
//       // }
//       node.regex = Object.values(near_rx_substrings)
//         .map((permutation) => permutation.join("|"))
//         .map((pattern) => tryRegExp(pattern, flag));
//     } else {
//       node.regex = [
//         tryRegExp(tryTaxoEquivalent(rx_pattern, taxo_parser.root_node), flag),
//       ];
//     }
//   });
//   return tree;
// }

// // usage
// const kw_search_string = "keyword1 OR keyword2 AND keyword3";
// const tree = convertKwSearchStringToTree(kw_search_string);
// debugger;
