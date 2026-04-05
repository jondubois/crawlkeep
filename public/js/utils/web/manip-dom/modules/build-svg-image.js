/**
 * @description Draws an image on the given SVG overlay, positioned and sized using SVG coordinates.
 * The image is appended as a child of an SVG element, and positioned relative to the SVG’s internal coordinate system (the viewBox).
 * Note: x/y are the canonical SVG-compatible coordinates. left/top should serve as a fallback if x/y are not present.
 * @param {SVGSVGElement} svg - The SVG overlay element.
 * @param {DOMRect|Object} rectBounding - A DOMRect or DOMRect-like object (with left, top, right, bottom, width, height, x, y).
 * @param {string} href - The image source URL.
 * @returns {SVGImageElement|undefined} The created SVG image element.
 */
export function buildSVGImage(svg, rectBounding, href) {
  if (!svg) {
    console.warn(
      `buildSVGImage - Expected an SVG overlay as a parent. Instead was passed ${svg}`,
    );
    return;
  }
  let { left, top, x, y, width, height } = rectBounding;
  x = x ?? left;
  y = y ?? top;

  if (width === undefined || height === undefined) {
    console.warn(
      `buildSVGImage - Expected width and height, as they are required for the image to render. Instead was passed width: ${width}, height: ${height}`,
    );
    return;
  }

  const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
  image.classList.add("svg-shape-image");
  if (x !== undefined && x !== null) image.setAttribute("x", String(x)); // to allow for 0 or "" (empty string), which are valid for SVG attributes.
  if (y !== undefined && y !== null) image.setAttribute("y", String(y));
  if (width !== undefined && width !== null)
    image.setAttribute("width", String(width));
  if (height !== undefined && height !== null)
    image.setAttribute("height", String(height));
  if (href !== undefined && href !== null) {
    image.setAttribute("href", String(href)); // for SVG 2
    image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", String(href)); // for SVG 1.1
  }

  return image;
}

// /**
//  * @description Draws an image on the given SVG overlay, positioned and sized using SVG coordinates.
//  * The image is appended as a child of an SVG element, and positioned relative to the SVG’s internal coordinate system (the viewBox).
//  * Note: x/y are the canonical SVG-compatible coordinates. left/top should serve as a fallback if x/y are not present.
//  * @param {SVGSVGElement} svg - The SVG overlay element.
//  * @param {DOMRect|Object} rectBounding - A DOMRect or DOMRect-like object (with left, top, right, bottom, width, height, x, y).
//  * @param {string} href - The image source URL.
//  * @param {Object} [attributes={}] - Additional SVG image attributes (optional).
//  * @returns {SVGImageElement|undefined} The created SVG image element.
//  */
// export function buildSVGImage(svg, rectBounding, href, attributes = {}) {
//   if (!svg) return;
//   let { left, top, x, y, width, height } = rectBounding;
//   x = x ?? left;
//   y = y ?? top;

//   const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
//   const allAttributes = {
//     x,
//     y,
//     width,
//     height,
//     href,
//     ...attributes,
//   };
//   Object.entries(allAttributes).forEach(([key, value]) => {
//     if (value !== undefined && value !== null) image.setAttribute(key, String(value));  // to allow for 0 or "" (empty string), which are valid for SVG attributes.
//   });

//   return image;
// }
