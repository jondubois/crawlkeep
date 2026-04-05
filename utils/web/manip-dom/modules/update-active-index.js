import { gi, ge, ges } from "./get-elm.js";

import { ComponentManager } from "../../classes/component-manager.js";
const comp_mngr = ComponentManager.getInstance();

/**
 * @description Updates the active match index displayed in the DOM based on the currently highlighted elements
 */
export function updateActiveIndex() {
  const active_match_index_cont = ge({
    scope: gi(comp_mngr.xh.count_cont.id),
    class_name: comp_mngr.getClassName("active_match_index"),
  });

  const highlighted_elms = Array.from(
    ges({
      scope: gi(comp_mngr.companyviewer.root_cont.id),
      class_name: ComponentManager.HIGHLIGHTED_CLASS,
    }),
  );
  active_match_index_cont.innerText =
    highlighted_elms.findIndex((elm) => elm.classList.contains("active")) + 1;
}
