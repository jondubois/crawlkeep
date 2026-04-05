/**
 * Scales SVG circle parameters (cx, cy, r) for responsiveness based on the rendered image size.
 * @param {HTMLImageElement} img - The image element the SVG overlays.
 * @param {Object} areaSelection - Object with cx, cy, r.
 * @returns {Object} - Scaled { cx, cy, r } object.
 */
export function scaleCircleForResponsiveness(img, circBounding) {
  const ratioX = img.offsetWidth / img.naturalWidth;
  const ratioY = img.offsetHeight / img.naturalHeight;
  const { cx, cy, r } = circBounding;
  const scaledCx = cx * ratioX;
  const scaledCy = cy * ratioY;
  // Use average of X and Y scaling for radius for best fit
  const scaledR = r * ((ratioX + ratioY) / 2);
  return { cx: scaledCx, cy: scaledCy, r: scaledR };
}
