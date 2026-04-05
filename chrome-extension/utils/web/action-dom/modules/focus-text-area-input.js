/**
 * @description Focuses the given textarea or input element and sets the cursor at the end.
 * @param {HTMLTextAreaElement|HTMLInputElement} textarea_or_input - The textarea or input element to focus.
 * @throws {TypeError} Throws an error if the provided element is not a valid textarea or input element.
 */
export function focusTextareaInput(textarea_or_input) {
  if (
    !(
      textarea_or_input instanceof HTMLTextAreaElement ||
      textarea_or_input instanceof HTMLInputElement
    )
  ) {
    throw new TypeError(
      `${
        focusTextareaInput.name
      } - Invalid element provided. Expected a textarea or input element, but received ${typeof textarea_or_input}.`,
    );
  }

  textarea_or_input.focus();
  textarea_or_input.setSelectionRange(
    textarea_or_input.value.length,
    textarea_or_input.value.length,
    "forward",
  );
}
