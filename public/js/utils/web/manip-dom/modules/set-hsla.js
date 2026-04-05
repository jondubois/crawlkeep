/**
 * Returns an hsla() CSS string with each channel factored by the given factors.
 * @param {Object} hsla - { hue, saturation, lightness, alpha }
 * @param {Object} factor - { hue, saturation, lightness, alpha }
 * @returns {string} hsla CSS string
 */
export function setHSLA(color) {
  const {hsla, factor} = color;
  if (typeof hsla !== "object" || hsla === null) {
    hsla = { hue: 142, saturation: 100, lightness: 75, alpha: 0.2 };
    console.warn(
      "setHSLA - Invalid hsla object provided, using default values.",
    );
  }
  const { hue = 1, saturation = 1, lightness = 1, alpha = 1 } = factor;

  // Clamp values to valid ranges
  const h = Math.round((hsla.hue ?? 0) * hue) % 360;
  const s = Math.min(100, Math.max(0, (hsla.saturation ?? 100) * saturation));
  const l = Math.min(100, Math.max(0, (hsla.lightness ?? 50) * lightness));
  const a = Math.min(1, Math.max(0, (hsla.alpha ?? 1) * alpha));

  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}
