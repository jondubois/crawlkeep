import { isValidElm } from "../../utils/web/check-dom/modules/is-valid-elm.js";
import {
  styleToHighlighted,
  insertTextNodeWithin,
} from "../../utils/web/manip-dom/index.js";
import { buildPart } from "./build-part.js";

import { ComponentManager } from "../../classes/component-manager.js";

/**
 * Highlights text in a target web element based on a regular expression.
 *
 * @description This function searches for text within a target element that matches a specified regular expression.
 * It highlights the matched text by wrapping it in a span element with a specific class and style.
 * The function uses recursion to traverse the DOM tree and apply the highlighting to all matching text nodes.
 *
 * @param {Object} config - The configuration object for the highlighting process.
 * @param {number} config.index - The index of the regular expression to use.
 * @param {HTMLElement} config.target_elm - The target element within which to search for and highlight text.
 * @param {RegExp} config.regex - The regular expression to match against the text content.
 *
 * @return {string[]} An array of unique strings that were highlighted.
 */
export function highlightHelper1(config) {
  const { index, target_elm, regex } = config;

  const matches = []; // const set_of_matches = new Set();

  function recurseHighlight(node) {
    /* `.data` property is specific to Text, Comment, and ProcessingInstruction nodes.
      Whereas `.textContent` returns the text content of the element and that of all its child nodes */
    if (node?.nodeType === Node.TEXT_NODE && node.data?.length > 0) {
      let match_i = node.data.search(regex); // returns -1 if no match was found
      if (match_i >= 0) {
        const text_to_highlight = node.data.match(regex)[0];

        // inject a node that carries the `text_to_highlight`
        const multi_highlighter_node = buildPart(
          ComponentManager.HIGHLIGHTED_CLASS,
          "span",
        ); // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark
        multi_highlighter_node.textContent = text_to_highlight;
        styleToHighlighted(multi_highlighter_node, index);
        insertTextNodeWithin(node, multi_highlighter_node, match_i);

        matches.push(text_to_highlight);
        // set_of_matches.add(text_to_highlight); // config.highlighted_nodes.push(multi_highlighter_node);
        return 1;
      }
    } else if (isValidElm(node)) {
      const children = node.childNodes;
      for (let i = 0; i < children.length; ++i) {
        let child = children[i];
        i += recurseHighlight(child);
      }
    }
    return 0;
  }
  recurseHighlight(target_elm);

  return matches;
  // return Array.from(set_of_matches);
}

// export function highlightText(config) {
//   // removeParentKeepChildrenBy(ComponentManager.HIGHLIGHTED_CLASS);
//   let search_matches = new Set();
//   for (let i = 0; i < config.regexes.length; i++) {
//     if (config.regexes[i]) {
//       const set_of_matches = highlightHelper({
//         ...config,
//         ...{ index: i },
//       }); // re-assigned by return value, then bubbled up the call chain
//       if (set_of_matches.size)
//         set_of_matches.forEach((match) => search_matches.add(match));
//       // setFirstNode(config, i);
//     }
//   }

//   return Array.from(search_matches);
// }

// /**
//  * Highlights text in a target element based on a regular expression.
//  *
//  * @description This function searches for text within a target element that matches a specified regular expression.
//  * It highlights the matched text by wrapping it in a span element with a specific class and style.
//  * The function uses recursion to traverse the DOM tree and apply the highlighting to all matching text nodes.
//  *
//  * @param {Object} config - The configuration object for the highlighting process.
//  * @param {RegExp[]} config.regexes - An array of regular expressions to match against the text content.
//  * @param {number} config.index - The index of the regular expression to use from the regexes array.
//  * @param {HTMLElement} config.target_elm - The target element within which to search for and highlight text.
//  *
//  * @return {Set<string>} A set of unique strings that were highlighted.
//  */
// export function highlightHelper(config) {
//   const regex = config.regexes[config.index];
//   const set_of_matches = new Set();

//   function recurseHighlight(node) {
//     /* `.data` property is specific to Text, Comment, and ProcessingInstruction nodes.
//       Whereas `.textContent` returns the text content of the element and that of all its child nodes */
//     if (node && node.nodeType === Node.TEXT_NODE && node.data.length > 0) {
//       let match_i = node.data.search(regex); // returns -1 if no match was found
//       if (match_i >= 0) {
//         const text_to_highlight = node.data.match(regex)[0];

//         // inject a node that carries the `text_to_highlight`
//         const multi_highlighter_node = buildPart(
//           ComponentManager.HIGHLIGHTED_CLASS,
//           "span",
//         ); // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark
//         multi_highlighter_node.textContent = text_to_highlight;
//         styleToHighlighted(multi_highlighter_node, config.index);
//         insertTextNodeWithin(node, multi_highlighter_node, match_i);

//         set_of_matches.add(text_to_highlight); // config.highlighted_nodes.push(multi_highlighter_node);
//         return 1;
//       }
//     } else if (isValidElm(node)) {
//       const children = node.childNodes;
//       for (let i = 0; i < children.length; ++i) {
//         let child = children[i];
//         i += recurseHighlight(child);
//       }
//     }
//     return 0;
//   }
//   recurseHighlight(config.target_elm);

//   return set_of_matches;
// }
