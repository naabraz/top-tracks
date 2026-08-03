import type { MessageValues } from "./types";

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

/**
 * Resolves `{placeholder}` tokens in a dictionary message, e.g.
 * `formatMessage('Results for {artist}', { artist: "Opeth" })`.
 * A placeholder without a matching value is left literal so a copy mistake
 * shows up on screen instead of silently rendering an empty string.
 */
export function formatMessage(template: string, values: MessageValues = {}): string {
  return template.replace(PLACEHOLDER_PATTERN, (placeholder, placeholderName) => {
    const value = values[placeholderName];
    return value === undefined ? placeholder : String(value);
  });
}
