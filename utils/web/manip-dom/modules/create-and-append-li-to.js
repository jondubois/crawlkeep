import { buildPart } from "../../components/modules/build-part.js";
/**
 * @description Updates the keyword list in the journal based on the highlighted results.
 * @param {Node} dom_node - The array of highlighted results.
 */
export function createAndAppendLiTo(parent_cont, config) {
  const { class_name, text_content } = config;

  if (!text_content) return;

  const li = buildPart("li", "li");
  li.classList.add("display-text", class_name); // ignores undefined
  li.textContent = text_content;
  parent_cont.appendChild(li);
}

/**
 * Creates and appends an <li> element with an <a> anchor to a given <ul> element.
 * @param {HTMLElement} parent_cont - The <ul> element to append the <li> to.
 * @param {Object} config - A keyed object with the properties `class_name`, `href`, and `content`.
 */
export function createAndAppendLiAnchorTo(parent_cont, config) {
  const { class_name, href, content } = config;

  if (!href) return;

  const li = buildPart("li", "li");
  li.classList.add(class_name); // ignores undefined

  const anchor = buildPart("anchor", "a");
  anchor.target = "_blank";
  anchor.href = href;
  anchor.textContent = content ?? href;

  li.appendChild(anchor);
  parent_cont.appendChild(li);
}
