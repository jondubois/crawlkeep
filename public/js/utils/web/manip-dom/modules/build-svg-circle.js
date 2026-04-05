/**
 * Draws a basic SVG circle on the given SVG overlay.
 * @param {SVGSVGElement} svg - The SVG overlay element.
 * @param {Object} boundingCirc - Object with cx, cy, r (center x, center y, radius).
 * @returns {SVGCircleElement|undefined} The created SVG circle element.
 */
export function buildSVGCircle(svg, boundingCirc) {
  if (!svg) return;
  const { cx, cy, r } = boundingCirc;

  if (cx === undefined || cy === undefined || r === undefined) {
    console.warn(`buildSVGCircle - Expected cx, cy, and r, as they are required for the circle to render. Instead, was passed:
      ${{ cx, cy, r }}`);
  }

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  circle.classList.add("svg-shape-circle");
  if (cx !== undefined && cx !== null) circle.setAttribute("cx", String(cx));
  if (cy !== undefined && cy !== null) circle.setAttribute("cy", String(cy));
  if (r !== undefined && r !== null) circle.setAttribute("r", String(r));

  svg.appendChild(circle);
  return circle;
}

// import { setHSLA } from "./set-hsla.js";

// /**
//  * @description Draws a circle on the given SVG overlay, supporting HSLA color and additional SVG style properties.
//  * @param {SVGSVGElement} svg - The SVG overlay element.
//  * @param {number} cx - The x coordinate of the circle center.
//  * @param {number} cy - The y coordinate of the circle center.
//  * @param {number} r - The radius of the circle.
//  * @param {Object} color - Color and style configuration for the circle (optional).
//  * @returns {SVGCircleElement|undefined} The created SVG circle element.
//  */
// export function buildSVGCircle(svg, cx, cy, r, color = {}) {
//   if (!svg) return;
//   const { hsla, bgFactor, borderFactor } = color;

//   const circle = document.createElementNS(
//     "http://www.w3.org/2000/svg",
//     "circle",
//   );
//   circle.setAttribute("cx", String(cx));
//   circle.setAttribute("cy", String(cy));
//   circle.setAttribute("r", String(r));
//   circle.setAttribute("fill", setHSLA(hsla, bgFactor));
//   circle.setAttribute("stroke", setHSLA(hsla, borderFactor));
//   circle.setAttribute("stroke-width", "4");

//   svg.appendChild(circle);
//   return circle;
// }
