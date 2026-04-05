import { gi } from "../../manip-dom/modules/get-elm.js";

export function isRightMargin(cont_id) {
  let rect = gi(cont_id).getBoundingClientRect();
  return rect.left + rect.width < window.innerWidth;
}
