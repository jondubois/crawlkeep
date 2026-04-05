/**
 * Draws a basic SVG rectangle on the given SVG overlay.
 * @param {SVGSVGElement} svg - The SVG overlay element.
 * @param {Object} rectBounding - Object with x, y, width, height.
 * @returns {SVGRectElement|undefined} The created SVG rect element.
 */
export function buildSVGRectangle(svg, rectBounding) {
  if (!svg) return;
  const { x, y, width, height } = rectBounding;

  if (
    x === undefined || x === null ||
    y === undefined || y === null ||
    width === undefined || width === null ||
    height === undefined || height === null
  ) {
    console.warn(
      `buildSVGRectangle - Expected x, y, width, and height, as they are required for the rectangle to render correctly. Instead was passed:,
      ${{ x, y, width, height} }`
    );
  }

  const rectangle = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rectangle.classList.add("svg-shape-rectangle");
  if (x !== undefined && x !== null) rectangle.setAttribute("x", String(x));
  if (y !== undefined && y !== null) rectangle.setAttribute("y", String(y));
  if (width !== undefined && width !== null) rectangle.setAttribute("width", String(width));
  if (height !== undefined && height !== null) rectangle.setAttribute("height", String(height));

  return rectangle;
}


// import { setHSLA } from "./set-hsla.js";

// /**
//  * @description Draws a rectangle on the given SVG overlay, supporting HSLA color and additional SVG style properties.
//  * Shape elements (like <circle>, <rect>, etc.) cannot be standalonely appended to the DOM,
//  * but appended as children of `document.createElementNS("http://www.w3.org/2000/svg", "svg")`.
//  * z-index applies to the SVG element, but not to shapes inside the SVG.
//  * Positioned relative to the SVG’s internal coordinate system (the viewBox).
//  * The viewBox uses the x, y, width, and height of the `DOMRect` object to specify the rectangle's position and size
//  * within the SVG's coordinate system.
//  * `DOMRect`'s top, left, right, and bottom are pixel positions relative to the viewport, not the SVG's internal coordinates.
//  * @param {SVGSVGElement} svg - The SVG overlay element.
//  * @param {Object} rectBounding - The x, y coordinates, and rectangles' width and height.
//  * @param {Object} color - Color and style configuration for the rectangle (optional).
//  * @returns {SVGRectElement|undefined} The created SVG rect element.
//  */
// export function buildSVGRectangle(svg, rectBounding, color = {}) {
//   if (!svg) return;
//   const { x, y, width, height } = rectBounding;
//   const {
//     hsla,
//     bgFactor,
//     borderFactor,
//     borderRadius,
//   } = color;

//   const rectangle = document.createElementNS(
//     "http://www.w3.org/2000/svg",
//     "rect",
//   );
//   rectangle.setAttribute("x", String(x));
//   rectangle.setAttribute("y", String(y));
//   rectangle.setAttribute("width", String(width));
//   rectangle.setAttribute("height", String(height));
//   rectangle.setAttribute("fill", setHSLA(hsla, bgFactor));
//   rectangle.setAttribute("stroke", setHSLA(hsla, borderFactor));
//   rectangle.setAttribute("stroke-width", "4");
//   rectangle.setAttribute("rx", String(borderRadius));
//   rectangle.setAttribute("ry", String(borderRadius));

//   return rectangle;
// }