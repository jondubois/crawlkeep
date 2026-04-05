import { isRightMargin } from "../../check-dom/modules/is-right-margin.js";
import { inlineStyler } from "./inline-styler.js";

import { ComponentManager } from "../../../../classes/component-manager.js";
const comp_mngr = ComponentManager.getInstance();

/**
 * Extends the size of a textarea element based on its value length and the key pressed.
 *
 * @param {HTMLTextAreaElement} elm - The textarea element to be resized.
 * @param {string} key - The key that was pressed, used to determine the resizing logic.
 *
 * @todo - Refactor: `cont_id` was hard-coded
 */
export function extendTextAreaByValueLength(elm, key) {
  const cont_id = comp_mngr.xh.root_cont.id; // "xh-keyword-box-input";
  let len = elm.value.length;
  let hen = elm.value.split(/\n/).length;
  let rect = elm.getBoundingClientRect();
  var new_w;
  var new_h;
  if (key == "Backspace") {
    new_w =
      elm.value.length < 1
        ? 150
        : rect.width < 156
          ? rect.width
          : rect.width - 10;
    new_h = elm.value.length < 1 ? 50 : rect.height;
  } else {
    new_w =
      elm.value.length < 1
        ? 150
        : rect.width < window.innerWidth * 0.52 && isRightMargin(cont_id)
          ? rect.width + len * 1.5
          : rect.width;
    new_h = key == "Enter" && rect.height < 120 ? hen * 50 : rect.height;
  }
  inlineStyler(elm, `{width: ${new_w}px; height: ${new_h}px;}`);
}
