/**
 * Build a soft two-stop gradient from a single accent hex, using CSS
 * `color-mix` so the lighter stop is derived automatically. Returns
 * `undefined` when no color is set, so callers fall back to their default.
 */
export function accentGradient(
  hex?: string | null,
  angle = 150
): string | undefined {
  if (!hex) return undefined;
  return `linear-gradient(${angle}deg, ${hex} 0%, color-mix(in srgb, ${hex} 52%, #fff) 100%)`;
}

/**
 * A solid tint of an app's accent color (mixed with white). Used for the icon
 * tile and phone screen. `undefined` without a color → caller's neutral default.
 */
export function accentTint(hex?: string | null, percent = 22): string | undefined {
  if (!hex) return undefined;
  return `color-mix(in srgb, ${hex} ${percent}%, #fff)`;
}
