import { inlineStyler } from "../../../../utils-web/dom-manip/modules/inline-styler.js";
// import { gi } from "./get-elm.js";

/**
 * Applies grid line positioning to an HTML element.
 * @param {HTMLElement} html_elm - The HTML element to position, which must be a direct child of a grid container.
 * @param {Array<Number>} line_numbers - An array representing the line numbers on the grid [grid-column-start, grid-column-end, grid-row-start, grid-row-end].
 */
export function linePositioner(html_elm, line_numbers) {
  if (!(html_elm instanceof HTMLElement)) {
    throw new Error("The provided element is not a valid HTML element.");
  }

  const [grid_column_start, grid_column_end, grid_row_start, grid_row_end] =
    line_numbers;
  inlineStyler(
    html_elm,
    `{grid-column-start: ${grid_column_start}; grid-column-end: ${grid_column_end}; grid-row-start: ${grid_row_start}; grid-row-end: ${grid_row_end};}`,
  );
}
