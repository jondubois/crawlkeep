import { initContentProcessing } from "../../../../init/modules/init-content-processing.js";
import { goToNextTerm } from "../../manip-keyboard/modules/go-to-next-term.js";
import { gi } from "../../manip-dom/modules/get-elm.js";

import { ComponentManager } from "../../../../classes/component-manager.js";
const comp_mngr = ComponentManager.getInstance();
import SearchManager from "../../../../classes/search-manager.js";

/**
 * Handles the key up event for the input field in the XH keyword box.
 *
 * @description processes the input value in the XH keyword box when a key is released.
 * It handles navigation through search terms using the arrow keys, processes the input value based on
 * the toggle state (regex or bool), and clears highlights if the input is empty.
 *
 * @param {KeyboardEvent} e - The keyboard event triggered by the key up action.
 *
 * @todo - Refactor: `xh_names_of_parts.root_cont`, "xh-keyword-box-input-head_mover" and `xh_names_of_parts.toggle_indicator` were hard-coded
 */
var last_value =
  ""; /* Variables declared in the module scope (outside of any function) persist for the lifetime of the module.
They are not garbage collected after each function execution */
export function xhInputKeyUp(e) {
  let current_value = e.currentTarget.value.trim();
  let val_changed = last_value !== current_value;

  let toggle_state = gi(comp_mngr.xh.toggle_indicator.id)?.getAttribute(
    ComponentManager.TOGGLE_STATE,
  );

  if (
    val_changed &&
    ((toggle_state === "regex" &&
      !/\.\*$|\.\+$|^\W{0,2}$|\|$/.test(current_value)) ||
      (toggle_state === "bool" && !/\W\"\W/.test(current_value)))
  ) {
    last_value = current_value;
    initContentProcessing([
      {
        [SearchManager.NAME_KEY]: gi(comp_mngr.xh.saved_search_name_input.id)
          .value,
        [SearchManager.SEARCH_EXPRESSION_KEY]: current_value,
        [SearchManager.TYPE_KEY]: toggle_state,
      },
    ]);
  }
  // if (val_changed && current_value == "") {
  //   removeParentKeepChildrenBy(ComponentManager.HIGHLIGHTED_CLASS);
  //   updateActiveIndex()); // TODO - hard-coded `"xh-keyword-box-input-head_mover"`
  // }
}

export function setDir(e) {
  e.preventDefault();
  e.stopPropagation();

  let direction = 0;
  if (e?.key === "ArrowDown") {
    direction = 1;
  } else if (e?.key === "ArrowUp") {
    direction = -1;
  }
  if (direction) goToNextTerm(direction);
}
