import { gi, ge, inlineStyler } from "../../manip-dom/index.js";
import { toggle_params } from "../../../../helper/modules/build-xh-ui.js";

import { ComponentManager } from "../../../../classes/component-manager.js";
const comp_mngr = ComponentManager.getInstance();

export function toggleSwitch() {
  const toogle_cont = gi(comp_mngr.xh.toggle_cont.id);
  const toggle_text = ge({
    scope: toogle_cont,
    class_name: comp_mngr.getClassName("toggle_text_type"),
  });
  const xh_toggle_indicator = ge({
    scope: toogle_cont,
    class_name: comp_mngr.xh.toggle_indicator.getClassName(),
  });
  const toggle_state = xh_toggle_indicator.getAttribute(
    ComponentManager.TOGGLE_STATE,
  );
  const indicator_width = toggle_params.header_height_px * 0.7;
  const cont_width = toggle_params.toggle_cont_width_px;

  if (toggle_state === "bool") {
    xh_toggle_indicator.setAttribute(ComponentManager.TOGGLE_STATE, "regex");
    toggle_text.innerText = "regex";
    inlineStyler(
      xh_toggle_indicator,
      `{
        transform: translate(${
          indicator_width + indicator_width / 2 - cont_width / 2
        }px,0px);
        background: #eb4034;
        }`,
    ); /* given CSS `display: flex; justify-content: center;` 
    children will be placed side by side next to each other starting from the center of the container. 
    `transform: translate()` creates a visual effect by moving the element from its original position,
    but it does not change the element's position in the document flow.
    Since `xh_toggle_indicator` comes first in the hierarchy, 
    the translation for `xh_toggle_indicator` is calculated relative to its original position,
    which is after the width of xh_toggle_indicator */
    inlineStyler(
      toggle_text,
      `{
        text-align: right; 
        transform: translate(50%, 0px);
      }`,
    );
  }
  if (toggle_state === "regex") {
    xh_toggle_indicator.setAttribute(ComponentManager.TOGGLE_STATE, "bool");
    toggle_text.innerText = "boolean";
    inlineStyler(
      xh_toggle_indicator,
      `{
        transform: translate(${
          cont_width / 2 + (indicator_width - indicator_width / 2)
        }px, 0px);
        background: #2683fc;
      }`,
    );
    inlineStyler(
      toggle_text,
      `{
        text-align: left;
        transform: translate(-50%, 0px);
      }`,
    );
  }
}
