import { ge } from "../../manip-dom/modules/get-elm.js";
import { buildPart } from "../../../../helper/index.js";

/**
 * Displays a toast message on the specified web element.
 *
 * @param {HTMLElement} target_elm - The web element to disable
 * @param {string} message_to_display - The message to display in the toast.
 * @param {HTMLElement} [parent=document.body] - The parent element where the toast message will be displayed.
 */
export function showToast(
  target_elm,
  message_to_display,
  parent = document.body,
) {
  target_elm.classList.add("disabled");
  var toast = ge({ scope: parent, class_name: "toast" });
  if (!toast) {
    toast = buildPart("toast");
    parent.appendChild(toast);
  }
  toast.textContent = message_to_display;
  toast.classList.add("toast", "show");
  setTimeout(() => {
    target_elm.classList.remove("disabled");
    toast.classList.remove("show");
  }, 2000);
}
