/**
 * @description Sets an attribute on a specified HTML element.
 * @param {HTMLElement} web_elm - The HTML element on which to set the attribute.
 * @param {string} name - The name of the attribute to set.
 * @param {string|number|null|boolean} value - The value of the attribute to set.
 */
export function setAttribute(web_elm, name, value) {
  // `value !== undefined` prevents setting the attribute at all if value is undefined. if the attribute is present at all, regardless of its actual value, its value is considered to be true (https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute#javascript)
  if (web_elm && value !== undefined) {
    web_elm.setAttribute(name, value ?? "");  // if value is null or undefined, an empty string is used. Allows for 0 or "" (empty string), which are valid.
  }
}