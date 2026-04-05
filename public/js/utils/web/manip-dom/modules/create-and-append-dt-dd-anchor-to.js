import { buildPart } from "./build-part.js";

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
