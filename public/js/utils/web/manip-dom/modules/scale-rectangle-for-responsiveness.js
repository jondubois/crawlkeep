
/**
 * @description Scales SVG rectangle parameters (x, y, width, height) for responsiveness based on the rendered image size.
 * @param {HTMLImageElement} img - The image element the SVG overlays.
 * @param {Object} areaSelection - Object with x, y, width, height.
 * @returns {Object} - Scaled { x, y, width, height } object.
 */
export function scaleRectangleForResponsiveness(img, areaSelection) {
  const ratioX = img.offsetWidth / img.naturalWidth;
  const ratioY = img.offsetHeight / img.naturalHeight;
  const { x, y, width, height } = areaSelection;
  const scaledX = x * ratioX;
  const scaledY = y * ratioY;
  const scaledWidth = width * ratioX;
  const scaledHeight = height * ratioY;
  return { x: scaledX, y: scaledY, width: scaledWidth, height: scaledHeight };
}