/**
 * @description Notifies the user by displaying a message in lieu of the text content of the target web element.
 * @param {HTMLElement} web_elm - The web element where the notification message will be displayed.
 * @param {string} message_to_display - The message to display in the notification.
 */
export function notifyUser(web_elm, message_to_display) {
  const original_text = web_elm.textContent;
  web_elm.textContent = message_to_display;
  web_elm.classList.add("disabled");
  setTimeout(() => {
    web_elm.classList.remove("disabled");
    web_elm.textContent = original_text;
  }, 1000);
}
