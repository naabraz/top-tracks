/**
 * Derives a stable hue angle (0–359) from a name, so each band gets a
 * consistent artwork/monogram tint without hardcoding a colour per artist.
 */
export function deriveHue(name: string): number {
  let hash = 0;
  for (const character of name) {
    hash = (hash * 31 + character.charCodeAt(0)) % 360;
  }
  return hash;
}
