import { updateActiveIndex } from "../../manip-dom/modules/update-active-index.js";
import { gi } from "../../manip-dom/modules/get-elm.js";
import { ComponentManager } from "../../../../classes/component-manager.js";
const comp_mngr = ComponentManager.getInstance();

export function goToNextTerm(next_prev) {
  gi(comp_mngr.companyviewer.root_cont.id).focus(); // for the `keyup` event to bubble up, `root_cont` must be focused
  const highlighted_elms = Array.from(
    document.getElementsByClassName(ComponentManager.HIGHLIGHTED_CLASS),
  );
  //  the "active" class is used to navigate through the search results
  const active_index = highlighted_elms
    .map((elm) => Array.from(elm.classList).some((c) => c === "active"))
    .indexOf(true);
  const active_elm = highlighted_elms[active_index];
  if (active_elm) {
    // let curr_i = highlighted_elms[active_index + next_prev]
    //   ? active_index + next_prev + 1
    //   : next_prev == -1
    //     ? highlighted_elms.length
    //     : 1;
    let next_elm = highlighted_elms[active_index + next_prev]
      ? highlighted_elms[active_index + next_prev]
      : next_prev === -1
        ? highlighted_elms.at(-1)
        : highlighted_elms[0];
    if (next_elm) {
      active_elm.classList.remove("active");
      next_elm.classList.add("active");
      updateActiveIndex();
      next_elm.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }
}
