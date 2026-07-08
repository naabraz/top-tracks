import { spotifyFetch } from "./api";

/**
 * Spotify is used purely as an image source: Last.fm provides the data, but its
 * artist images are placeholders and its track images are unreliable, so we look
 * each entity up on Spotify's search endpoint to get correct artwork.
 *
 * Every function is best-effort — any failure (missing credentials, rate limit,
 * no match) resolves to null so image lookups can never break the main result.
 */

interface SpotifyImage {
  url: string;
}

interface ArtistItem {
  images: SpotifyImage[];
}

interface AlbumItem {
  images: SpotifyImage[];
}

interface TrackItem {
  album: { images: SpotifyImage[] };
}

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

/** Returns the album cover of the given track — i.e. the track's real artwork. */
export async function searchTrackImage(artist: string, track: string): Promise<string | null> {
  const item = await search<TrackItem>("track", `${track} ${artist}`);
  return item?.album?.images?.[0]?.url ?? null;
}

export async function searchAlbumImage(artist: string, album: string): Promise<string | null> {
  const item = await search<AlbumItem>("album", `${album} ${artist}`);
  return item?.images?.[0]?.url ?? null;
}
