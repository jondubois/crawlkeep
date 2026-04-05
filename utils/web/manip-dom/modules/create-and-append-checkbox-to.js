import { buildPart } from "../../components/modules/build-part.js";

/**
 * @description Creates a checkbox element with an associated label and appends it to a specified parent container.
 * The function allows customization of the checkbox, label, and wrapper through configuration options.
 * @param {HTMLElement} parent_cont - The parent container to which the checkbox and its label will be appended.
 * @param {Object} checkbox_config - Configuration object for the checkbox and its wrapper.
 * @return {HTMLElement} The wrapper element containing the checkbox and its label.
 */
export function createAndAppendCheckboxTo(parent_cont, checkbox_config) {
  const { checked, class_cont, id, label, name, value, wrapper_tag } =
    checkbox_config;

  if (!id && !label) return;

  const { wrapper_cls, label_cls, checkbox_cls } = class_cont;
  const checkbox_wrapper = buildPart("checkbox-wrapper", wrapper_tag);
  if (wrapper_cls) checkbox_wrapper.classList.add(wrapper_cls); // ignores undefined

  const checkbox = buildPart("checkbox", "input");
  if (checkbox_cls) checkbox.classList.add(checkbox_cls);
  Object.assign(checkbox, {
    type: "checkbox",
    role: "checkbox",
    checked: checked || false, // sets the default checked state
    ...(id && { id }),
    ...(name && { name }),
    ...(value && { value }), //  because the value property of an `input` element is of type String, it coerces the number into a String
    ...(checked !== undefined && { checked }),
  });

  const checkbox_label = buildPart("checkbox-label", "label");
  if (label_cls) checkbox_label.classList.add(label_cls);
  checkbox_label.classList.add("display-text");
  Object.assign(checkbox_label, {
    ...(id && { htmlFor: id }), // associates the label with the checkbox
    ...(label && { innerHTML: label }),
  });

  checkbox_wrapper.appendChild(checkbox);
  checkbox_wrapper.appendChild(checkbox_label);
  parent_cont.appendChild(checkbox_wrapper);

  return checkbox_wrapper;
  // return {
  //   checkbox,
  //   checkbox_wrapper,
  //   checkbox_label
  // } TODO - return parts as an object
}
