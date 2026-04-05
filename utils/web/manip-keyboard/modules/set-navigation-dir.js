import { goToNextTerm } from "./go-to-next-term.js";

/**
 * @description Sets the navigation direction based on the key pressed and
 * triggers navigation to the next or previous term
 * @param {KeyboardEvent} e - The keyboard event containing the key pressed
 */
export function setNavigationDir(e) {
  e.preventDefault();
  e.stopPropagation();

  let direction = 0;
  if (e?.key === "ArrowDown") {
    direction = 1;
  } else if (e?.key === "ArrowUp") {
    direction = -1;
  }
  if (direction) goToNextTerm(direction);
}
