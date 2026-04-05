import { topZIndexer } from "./top-zindexer.js";
import { gi } from "./get-elm.js";

// event object is passed by default by the handler
export function dragElement(event) {
  event = event || window.event; // ensures backward compatibility with Internet Explorer
  event.preventDefault(); // in the case of a mousedown event, it prevents text selection or other default behaviors that might interfere with dragging.

  var parent_id = event.currentTarget.getAttribute("data-move-id");
  var root_container = parent_id
    ? gi(parent_id)
    : event.currentTarget.parentElement.parentElement;
  var pos1 = 0,
    pos2 = 0,
    // get the mouse cursor position at startup
    pos3 = event.clientX || 0,
    pos4 = event.clientY || 0;
  event.currentTarget.onmousedown = (e) => dragMouseDown(e);

  function dragMouseDown(event) {
    pos3 = event.clientX;
    pos4 = event.clientY;
    document.onmouseup = closeDragElement; // Warning: Do not prepend async to the `handleEvent()` function. It handles the `Promise` returned by the async function automatically
    document.onmousemove = (e) => elementDrag(e);
  }

  function elementDrag(event) {
    event.preventDefault();
    pos1 = pos3 - event.clientX;
    pos2 = pos4 - event.clientY;
    pos3 = event.clientX;
    pos4 = event.clientY;
    root_container.style.top = root_container.offsetTop - pos2 + "px";
    root_container.style.left = root_container.offsetLeft - pos1 + "px";
    root_container.style.opacity = "0.98";
    root_container.style.zIndex = topZIndexer();
  }

  async function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    root_container.style.opacity = "1";
    root_container.style.zIndex = topZIndexer();
    if (root_container.id) {
      let rect = root_container.getBoundingClientRect();
      try {
        await chrome.runtime.sendMessage({
          cmd: "setLatestRect",
          id: root_container.id,
          rect:
            rect.bottom < window.innerHeight &&
            rect.left < window.innerWidth - 50
              ? rect
              : { ...rect, ...{ top: 5, left: 5 } },
        });
      } catch (error) {
        console.error(
          `${closeDragElement.name} - Error sending message to background script:`,
          error,
        );
      }
    }
  }
}
