import {
  getArtistInfo,
  getSimilarArtists,
  getTopAlbum,
  getTopTrack,
} from "@/lib/lastfm/client";
import { searchAlbumArtwork, searchArtistArtwork } from "@/lib/spotify/images";
import type { ArtistLookupResult, SimilarArtist } from "./types";

/**
 * Assembles a full result for the given query.
 *
 * Core data (top track, top album, similar artists) comes from Last.fm; Spotify
 * is used only to backfill artwork the Last.fm response is missing. Returns null
 * when the artist cannot be found.
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

  const [artistArtwork, albumArtwork, similarArtworks] = await Promise.all([
    artist.imageUrl ? Promise.resolve(null) : searchArtistArtwork(artist.name),
    // Last.fm's top-albums image is often a generic shared thumbnail, so always
    // prefer Spotify's real cover art for this hero image when we can find it.
    topAlbum
      ? searchAlbumArtwork(topAlbum.artistName, topAlbum.name)
      : Promise.resolve(null),
    Promise.all(
      similarArtists.map((similar) =>
        similar.imageUrl ? Promise.resolve(null) : searchArtistArtwork(similar.name)
      )
    ),
  ]);

  if (artistArtwork) {
    artist.imageUrl = artistArtwork.imageUrl;
    artist.url = artistArtwork.spotifyUrl;
  }

  if (topAlbum && albumArtwork) {
    topAlbum.imageUrl = albumArtwork.imageUrl;
  }

  if (topTrack && !topTrack.imageUrl) {
    topTrack.imageUrl = topAlbum?.imageUrl ?? null;
  }

  const enrichedSimilar: SimilarArtist[] = similarArtists.map((similar, index) => {
    const artwork = similarArtworks[index];
    return artwork
      ? { ...similar, imageUrl: artwork.imageUrl, url: artwork.spotifyUrl }
      : similar;
  });

  return { artist, topTrack, topAlbum, similarArtists: enrichedSimilar };
}
