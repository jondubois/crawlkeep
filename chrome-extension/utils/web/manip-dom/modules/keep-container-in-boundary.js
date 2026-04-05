import { inlineStyler } from "./inline-styler.js";

/**
 * The last last known position (DOMRect) is requested from `chrome.storage`.
 * Had the user previously misplaced `cont` outside of the visible boundaries of the viewport,
 * it resets its position to the top left corner.
 *
 * @todo tight-couple it with `messageLocalStorage`
 */
export function keepContInBoundary(params) {
  var { cont } = params;
  var rect = cont.getBoundingClientRect();
  let wh = window.innerHeight;
  let ww = window.innerWidth;
  if (rect.height >= wh) {
    inlineStyler(cont, `{top:0px;}`);
  }
  if (rect.left + rect.width > ww) {
    let dif = ww - rect.width;
    inlineStyler(cont, `{left:${dif - 10}px;}`);
  }
}
