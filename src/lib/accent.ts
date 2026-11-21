/**
 * A solid tint of an app's accent color (mixed with white). Used for the icon
 * tile and phone screen. `undefined` without a color → caller's neutral default.
 */
export function accentTint(hex?: string | null, percent = 22): string | undefined {
  if (!hex) return undefined;
  return `color-mix(in srgb, ${hex} ${percent}%, #fff)`;
}
