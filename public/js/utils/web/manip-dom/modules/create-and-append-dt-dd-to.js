import { splitToSentences, toHtmlList } from "../../../core/manip-str/index.js";
import { buildPart } from "./build-part.js";

/**
 * @description Creates and appends <dt> and <dd> elements to a definition list.
 * @param {HTMLElement} parent_cont - The definition list
 * @param {Object} config - A keyed object with the properties `class_name`, `term`, and `description`.
 */
export function createAndAppendDtDdTo(parent_cont, config) {
  const { class_name, term, description, is_wrapped } = config;

  if (!term && !description) return; // informs user as `undefined` if the data can't be found in the JSON (ie. key exists [it's hard-coded] but the property is missing)

  const dt = buildPart("dt", "dt");
  dt.classList.add("display-text", "key", class_name); // ignores undefined
  dt.textContent = term;

  const dd = buildPart("dd", "dd");
  dd.classList.add("display-text", "value", class_name);
  dd.innerHTML = splitToSentences(String(description))
    .map((sentence) => toHtmlList(sentence))
    .join("");

  if (is_wrapped) {
    const wrapper = buildPart("prop_wrapper");
    wrapper.appendChild(dt);
    wrapper.appendChild(dd);
    parent_cont.appendChild(wrapper);
  } else {
    parent_cont.appendChild(dt);
    parent_cont.appendChild(dd);
  }
}
