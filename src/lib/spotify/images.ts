import { spotifyFetch } from "./api";

/**
 * Spotify no longer exposes popularity, top tracks, or related artists to new
 * apps, but its search endpoint still returns high-quality artwork. These
 * helpers use it purely to enrich Last.fm results with images and links.
 *
 * They are best-effort: any failure (missing credentials, rate limits, no
 * match) resolves to null so it can never break the main lookup.
 */

interface SpotifyImage {
  url: string;
}

interface SpotifySearchItem {
  images: SpotifyImage[];
  external_urls: { spotify: string };
}

export interface SpotifyArtwork {
  imageUrl: string;
  spotifyUrl: string;
}

async function searchArtwork(
  type: "artist" | "album",
  query: string,
  key: "artists" | "albums"
): Promise<SpotifyArtwork | null> {
  try {
    const params = new URLSearchParams({ q: query, type, limit: "1" });
    const data = await spotifyFetch<Record<string, { items: SpotifySearchItem[] }>>(
      `/search?${params}`
    );
    const item = data[key]?.items?.[0];
    const imageUrl = item?.images?.[0]?.url;

    if (!item || !imageUrl) {
      return null;
    }
    return { imageUrl, spotifyUrl: item.external_urls.spotify };
  } catch {
    return null;
  }
}

export function searchArtistArtwork(name: string): Promise<SpotifyArtwork | null> {
  return searchArtwork("artist", name, "artists");
}

export function searchAlbumArtwork(artist: string, album: string): Promise<SpotifyArtwork | null> {
  return searchArtwork("album", `${album} ${artist}`, "albums");
}
