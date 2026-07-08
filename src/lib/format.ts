/** Formats a track duration given in milliseconds as `m:ss`. */
export function formatDuration(durationMs: number): string {
  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Formats a follower count as a compact string, e.g. 1200000 -> "1.2M". */
export function formatFollowers(count: number): string {
  if (count < 1_000) {
    return count.toString();
  }
  if (count < 1_000_000) {
    return `${trimTrailingZero(count / 1_000)}K`;
  }
  return `${trimTrailingZero(count / 1_000_000)}M`;
}

function trimTrailingZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

/** Formats a Spotify release date (YYYY, YYYY-MM, or YYYY-MM-DD) as a year. */
export function formatReleaseYear(releaseDate: string): string {
  return releaseDate.slice(0, 4);
}
