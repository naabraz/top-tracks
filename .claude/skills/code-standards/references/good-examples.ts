// GOOD EXAMPLES — code that follows the code-standards rules.
//
// Every example below:
//   - is written in English (rule 1)
//   - has a body under 30 lines (rule 2)
//   - takes at most 3 parameters (rule 3)
//   - is named starting with a verb (rule 4)
//   - nests if/else at most 2 levels deep (rule 5)
//   - uses maps or early returns instead of switch (rule 6)
//   - uses descriptive, unambiguous names (rule 7)
// Shared types live in their own module (rule 8).

import type { ArtistSummary, PlaybackStatus } from "./types";

// ✅ Rule 3: more than three inputs are grouped into one options object.
interface FetchArtistOptions {
  artistName: string;
  includeSimilar: boolean;
  imageSize: "small" | "large";
}

// ✅ Rules 2, 3, 4, 7: verb name, few params, short body, clear names.
export function buildArtistLabel(artist: ArtistSummary): string {
  const listenerCount = artist.listeners.toLocaleString();
  return `${artist.name} — ${listenerCount} listeners`;
}

// ✅ Rule 5: guard clauses keep nesting to a single level.
export function resolveImageUrl(
  primaryUrl: string | null,
  fallbackUrl: string,
): string {
  if (primaryUrl) {
    return primaryUrl;
  }
  return fallbackUrl;
}

// ✅ Rule 6: a lookup map replaces switch/case.
const STATUS_LABELS: Record<PlaybackStatus, string> = {
  idle: "Ready",
  loading: "Loading…",
  success: "Done",
  error: "Something went wrong",
};

export function describeStatus(status: PlaybackStatus): string {
  return STATUS_LABELS[status];
}

// ✅ Rule 3: options object instead of a long parameter list.
export function fetchArtist(options: FetchArtistOptions): Promise<ArtistSummary> {
  const { artistName, imageSize } = options;
  const query = new URLSearchParams({ name: artistName, size: imageSize });
  return fetch(`/api/artist?${query}`).then((response) => response.json());
}
