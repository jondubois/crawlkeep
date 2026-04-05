/**
 * @description Creates and appends an SVG overlay positioned absolutely over the target element.
 * @param {HTMLImageElement} target - The element to overlay the SVG on (e.g. <img>, <canvas>, <video>, etc).
 * @param {string} overlayId - The ID to assign to the created SVG overlay element.
 * @return {SVGSVGElement|undefined} The created SVG overlay element, or undefined if the image is not provided.
 */
export function buildSVGOverlayOn(target, overlayId) {
  if (!target) return;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = overlayId;
  svg.classList.add("svg-overlay");
  svg.style.position = "absolute";
  svg.style.left = "0px";
  svg.style.top = "0px";
  svg.setAttribute("width", "100%"); // upon re-sizing, for responsiveness, SVG matches its container's size, which is that of the image
  svg.setAttribute("height", "100%");
  svg.setAttribute(
    "viewBox",
    `0 0 ${target.offsetWidth} ${target.offsetHeight}`,
  ); /* .offsetWidth and .offsetHeight are available on all HTML elements (e.g. <img>, <canvas>, <video>, <svg>, <div>/block, <textarea>, <iframe>).
    Sets the SVG’s internal coordinate system
    to match the rendered pixel size of the image
    at the time the overlay is created.
    https://developer.mozilla.org/en-US/docs/Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements#how_much_room_does_it_use_up */
  svg.style.pointerEvents = "none";

  // Append to the wrapper of the image
  target.parentNode.appendChild(svg);

  return svg;
}
