import { spotifyFetch } from "./api";
import type { AlbumDetails, AlbumItem, ArtistItem, TrackDetails, TrackItem } from "./types";

/**
 * Spotify fills the gaps Last.fm leaves: its artist images are placeholders, its
 * track images are unreliable, and it carries no release date at all, so we look
 * each entity up on Spotify's search endpoint. Last.fm stays the source of truth
 * for every ranking and count.
 *
 * Every function is best-effort — any failure (missing credentials, rate limit,
 * no match) resolves to null so these lookups can never break the main result.
 */

async function search<T>(type: string, query: string): Promise<T | null> {
  try {
    const params = new URLSearchParams({ q: query, type, limit: "1" });
    const data = await spotifyFetch<Record<string, { items: T[] }>>(`/search?${params}`);
    return data[`${type}s`]?.items?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function searchArtistImage(name: string): Promise<string | null> {
  const item = await search<ArtistItem>("artist", name);
  return item?.images?.[0]?.url ?? null;
}

/** Reads the year off a Spotify release date of any precision. */
function parseReleaseYear(releaseDate: string | undefined): number | null {
  const year = Number.parseInt(releaseDate?.slice(0, 4) ?? "", 10);
  return Number.isNaN(year) ? null : year;
}

/**
 * Looks the track up once and returns its cover plus the album carrying it —
 * i.e. the track's real artwork and its real record. All three facts come from
 * the same match, so they can never disagree — and it costs one request.
 */
export async function searchTrackDetails(artist: string, track: string): Promise<TrackDetails> {
  const item = await search<TrackItem>("track", `${track} ${artist}`);
  return {
    imageUrl: item?.album?.images?.[0]?.url ?? null,
    albumName: item?.album?.name ?? null,
    releaseYear: parseReleaseYear(item?.album?.release_date),
  };
}

/**
 * Looks the album up once and returns both facts we need from it. The cover and
 * the year come from the same match, so they can never describe different
 * records — and it costs one request rather than two.
 */
export async function searchAlbumDetails(artist: string, album: string): Promise<AlbumDetails> {
  const item = await search<AlbumItem>("album", `${album} ${artist}`);
  return {
    imageUrl: item?.images?.[0]?.url ?? null,
    releaseYear: parseReleaseYear(item?.release_date),
  };
}
