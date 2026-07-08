import {
  getArtistInfo,
  getSimilarArtists,
  getTopAlbum,
  getTopTrack,
} from "@/lib/lastfm/client";
import type { ArtistLookupResult } from "./types";

/**
 * Assembles a full result for the given query from the Last.fm API: the
 * artist's info plus their top track, top album, and similar artists. Returns
 * null when the artist cannot be found.
 */
export async function lookupArtist(query: string): Promise<ArtistLookupResult | null> {
  const artist = await getArtistInfo(query);
  if (!artist) {
    return null;
  }

  const [topTrack, topAlbum, similarArtists] = await Promise.all([
    getTopTrack(artist.name),
    getTopAlbum(artist.name),
    getSimilarArtists(artist.name),
  ]);

  // A track's own image is often missing; fall back to the album artwork.
  if (topTrack && !topTrack.imageUrl) {
    topTrack.imageUrl = topAlbum?.imageUrl ?? null;
  }

  return { artist, topTrack, topAlbum, similarArtists };
}
