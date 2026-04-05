import { buildPart } from "../../../../helper/modules/build-part.js";
import {
  toHtmlList,
  splitToSentences,
} from "../../../shared/manip-str/index.js";

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

/**
 * @description Creates and appends <dt> and <dd> elements with an anchor to a definition list.
 * @param {HTMLElement} parent_cont - The definition list
 * @param {Object} config - A keyed object with the properties `class_name`, `term`, and `url`.
 */
export function createAndAppendDtDdAnchorTo(parent_cont, config) {
  const { class_name, term, url, is_wrapped } = config;

  if (!term && !url) return;

  const dt = buildPart("dt", "dt");
  dt.classList.add("display-text", "key", class_name); // ignores undefined
  dt.textContent = term;

  const dd = buildPart("dd", "dd");
  const anchor = buildPart("anchor", "a");
  anchor.classList.add(class_name);
  anchor.target = "_blank";
  anchor.href = url;
  anchor.textContent = url;
  dd.appendChild(anchor);

  if (is_wrapped) {
    const wrapper = buildPart("prop_wrapper");
    wrapper.appendChild(dt);
    wrapper.appendChild(dd);
    parent_cont.appendChild(wrapper);
  } else {
    parent_cont.appendChild(dt);
    parent_cont.appendChild(dd);
  }

  return { dt, dd, anchor }; // wrapper
}
