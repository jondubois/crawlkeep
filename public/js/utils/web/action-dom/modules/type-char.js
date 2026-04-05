/**
 * @description Animates typing of a given text into a textarea element, simulating natural typing speed.
 * @param {number} i - The current character index to type.
 * @param {string} text - The text string to be typed into the textarea.
 * @param {HTMLTextAreaElement} textarea - The textarea DOM element where the text will be typed.
 */
export function typeChar(i, text, textarea) {
  if (i <= text.length) {
    textarea.value = text.slice(0, i);
    i++;
    setTimeout(() => typeChar(i, text, textarea), 35); // Typing speed in ms
  } else {
    textarea.disabled = false;
    textarea.focus();
  }
}
