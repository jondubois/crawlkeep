/**
 * @description
 * Creates a new HTML element with the specified tag name.
 *
 * @param {string} [tag="div"] - The tag name of the element to create.
 * @returns {HTMLElement} The newly created HTML element.
 */
export function createElm(tag = "div") {
  return document.createElement(tag);
}

/**
 * @description
 * Sets an attribute on a specified HTML element.
 *
 * @param {HTMLElement} web_elm - The HTML element on which to set the attribute.
 * @param {string} name - The name of the attribute to set.
 * @param {string} value - The value of the attribute to set.
 */
export function setAttribute(web_elm, name, value) {
  if (web_elm) {
    web_elm.setAttribute(name, value);
  }
}

/**
 * @description Sets multiple attributes on a specified HTML element.
 *
 * @param {HTMLElement} web_elm - The HTML element on which to set the attributes.
 * @param {Object} attributes - An object containing key-value pairs of attributes to set.
 */
export function setAttributes(web_elm, attributes) {
  if (web_elm && attributes) {
    Object.entries(attributes).forEach(([name, value]) => {
      web_elm.setAttribute(name, value);
    });
  }
}

/**
 * @description
 * Sets multiple CSS styles on a specified HTML element.
 *
 * @param {HTMLElement} elm - The HTML element on which to set the styles.
 * @param {Object} styling - An object containing key-value pairs of CSS properties and values.
 */
export function setStyles(elm, styling, priority = "important") {
  if (elm && styling) {
    Object.entries(styling).forEach(([key, value]) => {
      elm.style.setProperty(key, value, priority);
    });
  }
}

/**
 * @description
 * Sets multiple attributes on an HTML element. If an attribute with the same name:
 * - already exists, overwrites with the new value
 * - does not exist, adds the new attribute to the element, leaving the others untouched.
 *
 * @param {HTMLElement} html_elm - The HTML element on which to set the attributes.
 * @param {Array<Array<string>>} pairs - An array of name-value pairs to set on the element.
 */
export function a(html_elm, pairs, is_overwriten = false) {
  pairs.forEach((pair) => {
    const [name, value] = pair;
    const curr_val = html_elm.getAttribute(name);
    let new_val;
    if (is_overwriten) {
      new_val = value;
    } else {
      new_val = curr_val ? `${curr_val} ${value}` : value;
    }
    html_elm.setAttribute(name, new_val); // `.setAttribute(` over-writes existing value
  });
}
