import { buildPart } from "../../../../helper/modules/build-part.js";

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
