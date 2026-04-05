import { atobJSON } from "../../../shared/manip-data/modules/encoding-decoding.js";
import { gi, inlineStyler, topZIndexer } from "../index.js";

export function adjustElementSize(event) {
  const serialised_dim = event.currentTarget.getAttribute(
    "data-parent-dimensions",
  );
  const parent_dimensions = serialised_dim ? atobJSON(serialised_dim) : null;
  const [cbod_id, tbod_id] = event.currentTarget
    .getAttribute("data-resize-id")
    .split(/,/);
  const cbod = gi(cbod_id);
  const tbod = gi(tbod_id);
  // let tbod_css = atobJSON(tbod.getAttribute('data-css'))
  // let tbod_css = tbod.getBoundingClientRect();
  let header_pxs = cbod?.firstChild.style.gridTemplateColumns
    .split(/\s/)
    .map((r) => /[\d\.]+/.exec(r)?.[0])
    .filter((r) => r)
    .map((r) => parseFloat(r));
  const min_width = header_pxs?.length
    ? header_pxs.reduce((a, b) => a + b) + 60
    : 120;
  const foot_height = 0;
  /* declared as `var` to be hoisted to the top of its function scope, thus expanding the closure to function scope, 
    so it can be accessible in `closeDragElement()`; even though, in this case, it wsan't necessary */
  var pos1 = 0,
    pos2 = 0,
    pos3 = event.clientX || 0,
    pos4 = event.clientY || 0;
  var width = cbod.getBoundingClientRect().width;
  var height = cbod.getBoundingClientRect().height;
  var parent_id = event.currentTarget.getAttribute("data-move-id");
  var root_container = parent_id
    ? gi(parent_id)
    : event.currentTarget.parentElement.parentElement;

  event.currentTarget.addEventListener(
    "mousedown",
    dragMouseDown,
  ); /* didn't pass an anonymous function, `(e) => dragMouseDown(e)`,
  since it needs to be registered as an event listener to be removed by `closeDragElement` */

  function dragMouseDown(event) {
    pos3 = event.clientX;
    pos4 = event.clientY;
    document.addEventListener("mouseup", closeDragElement);
    document.addEventListener("mousemove", elementDrag);
  }
  function elementDrag(event) {
    let moved_width = width - (pos3 - event.clientX);
    let main_width = moved_width < min_width ? min_width : moved_width;
    let main_height = height - (pos4 - event.clientY) - foot_height;
    inlineStyler(
      cbod,
      `{width: ${main_width}px;${
        moved_width < min_width ? "" : " height: " + main_height + "px; "
      }z-index: ${topZIndexer()};}`,
    );
    if (tbod) {
      inlineStyler(
        tbod,
        `{
            width: ${
              main_width -
              ((parent_dimensions?.left_panel_width_px || 0) +
                (parent_dimensions?.right_panel_width_px || 0))
            }px;
            height: ${
              main_height -
              ((parent_dimensions?.header_height_px || 0) +
                (parent_dimensions?.footer_height_px || 0))
            }px;
            opacity: 0.98; transiation: opacity 100ms;
          }`,
      );
    }
  }
  async function closeDragElement() {
    document.removeEventListener("mouseup", closeDragElement);
    document.removeEventListener("mousemove", elementDrag);
    if (tbod) tbod.style.opacity = "1";

    // record latest position of the parent element, `root_cont`
    if (root_container.id) {
      await chrome.runtime.sendMessage({
        cmd: "setLatestRect",
        id: root_container.id,
        rect: root_container.getBoundingClientRect(),
      });
    }
  }
}
