import { ComponentManager } from "../../classes/component-manager.js";
import SearchManager from "../../classes/search-manager.js";
const search_mngr = SearchManager.getInstance();

/**
 * @description Applies a highlight style to a DOM node based on its index.
 * The function calculates a unique hue for the node and assigns a corresponding CSS class
 * to style the node with a specific color and text contrast.
 * @param {HTMLElement} node - The DOM element to which the highlight style will be applied.
 * @param {number} i - The index of the node, used to calculate the hue for the highlight color.
 * @return {void} This function does not return a value. It modifies the DOM element's class list directly.
 */
export function styleToHighlighted(node, i) {
  const GAP =
    360 /
    (search_mngr.search_criteria.length +
      1); /* allows for as many different colors as there are search criteria
          + 1 in the eventuality of user input in textarea */
  const hue = Math.round((i + 1) * GAP); // degree on the color wheel (from 0 to 360)

  let hue_bracket;

  switch (true) {
    case hue >= 0 && hue <= 39:
      hue_bracket = "hue-0-39"; // white text for red to orange hues
      break;
    case hue >= 40 && hue <= 99:
      hue_bracket = "hue-40-99"; // black text for yellow to green hues
      break;
    case hue >= 100 && hue <= 168:
      hue_bracket = "hue-100-168"; // white text for green to cyan hues
      break;
    case hue >= 169 && hue <= 189:
      hue_bracket = "hue-169-189"; // black text for cyan hues
      break;
    case hue >= 190 && hue <= 240:
      hue_bracket = "hue-190-240"; // light yellow text for blue hues
      break;
    case hue >= 241 && hue <= 300:
      hue_bracket = "hue-241-300"; // light green text for purple hues
      break;
    case hue >= 301 && hue <= 360:
      hue_bracket = "hue-301-360"; // white text for magenta to red hues
      break;
    default:
      // no conditions are met
      hue_bracket = "hue-0-39";
      console.error(`${styleToHighlighted.name} - Error: hue class not found.`);
      break;
  }

  node.classList.add(ComponentManager.HIGHLIGHTED_CLASS, hue_bracket);
}
