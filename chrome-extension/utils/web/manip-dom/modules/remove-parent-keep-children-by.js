/**
 * @description Removes the parent element with the specified class name, and optionally tag, but keeps its children elements.
 * @param {string} class_name - The class name of the parent element to be removed.
 * @param {string} [tag] - The optional tag name of the parent element to be removed.
 */
export function removeParentKeepChildrenBy(class_name, tag) {
  const selector = tag ? `${tag}.${class_name}` : `.${class_name}`;
  let node;
  while ((node = document.body.querySelector(selector))) {
    // `querySelector` returns a static `NodeList`, which does not automatically update
    node.outerHTML = node.innerHTML;
  }
}
