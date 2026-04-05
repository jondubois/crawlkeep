/**
 * @description Draws a rectangular overlay (using a fixed-position <div>) over any DOM element,
 * including inline elements like <span>, <b>, <i>, etc.
 * @param {Object} boundingRect - An object with {left, top, width, height} properties (`getBoundingClientRect()`).
 * @returns {HTMLDivElement} The overlay div element.
 * @todo - implement the commented-out code below to support `bottom`, `right`.
 **/
export function buildRectangleOverlay(boundingRect) {
  const { x, y, left, top, width, height, bottom, right } = boundingRect;

  if (
    (x === undefined && left === undefined) ||
    (y === undefined && top === undefined) ||
    width === undefined ||
    height === undefined
  ) {
    console.warn(
      `buildRectangleOverlay - Expected x/left, y/top, width, and height, as they are required for the overlay to render correctly. Instead was passed:,
      ${{ x, y, left, top, width, height }}
    `,
    );
  }

  /* For position: fixed or absolute, right and bottom are offsets from the viewport's right/bottom edges, not
  coordinates. Setting style with `.style.bottom` and `.style.right` (browser will use `inset` shortcut) equates to:
  height = window.innerHeight - top - bottom
  width = window.innerWidth - left - right
  Subsequently, if right and bottom are used rather than height and width, then the offset should corrected,
  as follows:
  - width = right - left
  - height = bottom - top. */
  const overlay = document.createElement("div");
  overlay.className = "dom-elm-overlay";
  overlay.style.position = "absolute"; // overlay covers the viewport and stays in place even when the page is scrolled
  
  // Add scroll offset to convert viewport-relative coordinates to page-relative coordinates
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  
  if (x !== undefined && x !== null) overlay.style.left = (x + scrollX) + "px";
  else if (left !== undefined && left !== null)
    overlay.style.left = (left + scrollX) + "px";
  if (y !== undefined && y !== null) overlay.style.top = (y + scrollY) + "px";
  else if (top !== undefined && top !== null) overlay.style.top = (top + scrollY) + "px";
  if (width !== undefined && width !== null) overlay.style.width = width + "px";
  if (height !== undefined && height !== null)
    overlay.style.height = height + "px";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "1000";

  document.body.appendChild(overlay);
  return overlay;
}


// /**
//  * @description Draws a rectangular overlay (using a fixed-position <div>) over any DOM element,
//  * including inline elements like <span>, <b>, <i>, etc.
//  * @param {Object} boundingRect - An object with either {left, top, width, height} or {left, top, right, bottom}.
//  * @returns {HTMLDivElement} The overlay div element.
//  **/
// export function buildRectangleOverlay(boundingRect) {
//   const { x, y, left, top, width, height, bottom, right } = boundingRect;

//   // Determine which build mode to use
//   let mode = null;
//   if (
//     left !== undefined && top !== undefined &&
//     right !== undefined && bottom !== undefined
//   ) {
//     mode = "inset";
//   } else if (
//     (x !== undefined || left !== undefined) &&
//     (y !== undefined || top !== undefined) &&
//     width !== undefined &&
//     height !== undefined
//   ) {
//     mode = "rect";
//   } else {
//     console.warn(
//       `buildRectangleOverlay - Expected either {left, top, right, bottom} or {left, top, width, height}. Received:`,
//       { x, y, left, top, width, height, right, bottom }
//     );
//   }

//   const overlay = document.createElement("div");
//   overlay.className = "dom-elm-overlay";
//   overlay.style.position = "fixed";

//   switch (mode) {
//     case "inset":
//       // Use left, top, right, bottom for responsive overlay
//       overlay.style.left = left + "px";
//       overlay.style.top = top + "px";
//       overlay.style.right = right + "px";
//       overlay.style.bottom = bottom + "px";
//       break;
//     case "rect":
//       // Use left/top/width/height for fixed-size overlay
//       if (x !== undefined && x !== null) overlay.style.left = x + "px";
//       else if (left !== undefined && left !== null) overlay.style.left = left + "px";
//       if (y !== undefined && y !== null) overlay.style.top = y + "px";
//       else if (top !== undefined && top !== null) overlay.style.top = top + "px";
//       if (width !== undefined && width !== null) overlay.style.width = width + "px";
//       if (height !== undefined && height !== null) overlay.style.height = height + "px";
//       break;
//     default:
//       // Fallback: do nothing, overlay may not render correctly
//       break;
//   }

//   overlay.style.pointerEvents = "none";
//   overlay.style.zIndex = String(Date.now() - 1000);

//   document.body.appendChild(overlay);
//   return overlay;
// }

// import { setHSLA } from "./set-hsla.js";

// /**
//  * @description Draws a rectangular overlay (using a fixed-position <div>) over any DOM element,
//  * including inline elements like <span>, <b>, <i>, etc.
//  * Removes any existing overlays before rendering the new one.
//  * @param {Object} boundingRect - An object with {left, top, width, height} properties (`getBoundingClientRect()`).
//  * @param {Object} color - Color configuration for the overlay (optional).
//  * @returns {HTMLDivElement} The overlay div element.
//  **/
// export function buildRectangleOverlay(boundingRect, color = {}) {
//   const { x, y, left, top, right, bottom, width, height } =
//     boundingRect; /* `DOMRect`'s top, left (`x` and `y` are aliases for `left` and `top`), right, and bottom are pixel positions relative to the viewport;
//     `width` and `height` are the dimensions of a rectangle. */

//   const {
//     hsla ,
//     bgFactor ,
//     borderFactor,
//   } = color;

//   // Create overlay div
//   const overlay = document.createElement("div");
//   overlay.className = "dom-elm-overlay";
//   overlay.style.position = "fixed"; // overlay covers the viewport and stays in place even when the page is scrolled
//   if (x !== undefined) overlay.style.left = x + "px";
//   if (y !== undefined) overlay.style.top = y + "px";
//   if (left !== undefined) overlay.style.left = left + "px";
//   if (top !== undefined) overlay.style.top = top + "px";
//   /*
//   * For position: fixed or absolute, right and bottom are offsets from the viewport's right/bottom edges, not
//   * coordinates. Setting style with `.style.bottom` and `.style.right` (browser will use inset shortcut) equates to:
//   * height = window.innerHeight - top - bottom
//   * width = window.innerWidth - left - right
//   * Subsequently, if right and bottom are used rather than height and width, then the offset should corrected,
//   * as follows:
//   * - width = right - left
//   * - height = bottom - top.
//   */
//   if (width !== undefined) {
//     overlay.style.width = width + "px";
//   } else if (right !== undefined && left !== undefined) {
//     overlay.style.width = (window.innerWidth - left - right) + "px";
//   }
//   if (height !== undefined) {
//     overlay.style.height = height + "px";
//   } else if (bottom !== undefined && top !== undefined) {
//     overlay.style.height = (window.innerHeight - top - bottom) + "px";
//   }
//   overlay.style.background = setHSLA(hsla, bgFactor);
//   overlay.style.transition = "opacity 0.3s";
//   overlay.style.opacity = "1";
//   overlay.style.pointerEvents = "none";
//   overlay.style.zIndex = String(Date.now() - 1000);
//   document.body.appendChild(overlay);

//   return overlay;
// }
